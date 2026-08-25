from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.fault import FaultEvent
from app.models.telemetry import TelemetryReading
from app.schemas.telemetry import HistoricalPoint, TelemetryReadingCreate, TelemetryReadingResponse
from app.services.alert_engine import evaluate_reading
from app.services.broadcast import broadcast
from app.services.health_score import compute_health_score
from app.services.notifications import send_notification

router = APIRouter()


@router.post("", response_model=TelemetryReadingResponse)
async def ingest_telemetry(
    payload: TelemetryReadingCreate,
    db: AsyncSession = Depends(get_db),
):
    vehicle_id = payload.vehicleId

    record = TelemetryReading(
        vehicle_id=vehicle_id,
        speed_kph=payload.speedKph,
        rpm=payload.rpm,
        engine_temp_c=payload.engineTempC,
        battery_voltage=payload.batteryVoltage,
        gear=payload.gear,
        lat=payload.lat,
        lng=payload.lng,
        timestamp=payload.timestamp or datetime.now(timezone.utc),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    result = await evaluate_reading(payload, vehicle_id, db)
    active_fault_count = len([
        f for f in result.triggered if f.active
    ])

    health_score = compute_health_score(
        payload.engineTempC,
        payload.batteryVoltage,
        active_fault_count,
    )

    reading_data = {
        "id": str(record.id),
        "timestamp": record.timestamp.isoformat(),
        "speedKph": record.speed_kph,
        "rpm": record.rpm,
        "engineTempC": record.engine_temp_c,
        "batteryVoltage": record.battery_voltage,
        "gear": record.gear,
        "lat": record.lat,
        "lng": record.lng,
    }
    await broadcast.publish_reading(reading_data)

    for fault in result.triggered:
        fault_data = {
            "id": fault.id,
            "code": fault.code,
            "message": fault.message,
            "severity": fault.severity,
            "triggeredAt": fault.triggered_at.isoformat(),
            "active": fault.active,
        }
        await broadcast.publish_fault(fault_data)
        await send_notification(fault)

    for fault_id in result.cleared:
        await broadcast.publish_fault_clear(fault_id)

    return record


@router.get("/history", response_model=list[HistoricalPoint])
async def get_telemetry_history(
    range: str = Query("24h", regex="^(1h|24h|7d)$"),
    db: AsyncSession = Depends(get_db),
):
    range_map = {"1h": timedelta(hours=1), "24h": timedelta(hours=24), "7d": timedelta(days=7)}
    since = datetime.now(timezone.utc) - range_map[range]

    bucket = "5 minutes" if range == "7d" else "1 minute"

    query = text("""
        SELECT
            time_bucket(:bucket, timestamp) AS bucket,
            AVG(engine_temp_c) AS engine_temp_c,
            AVG(battery_voltage) AS battery_voltage,
            AVG(rpm) AS rpm
        FROM telemetry_readings
        WHERE timestamp >= :since
        GROUP BY bucket
        ORDER BY bucket ASC
    """)

    result = await db.execute(query, {"bucket": bucket, "since": since})
    rows = result.fetchall()

    return [
        HistoricalPoint(
            timestamp=row[0],
            engineTempC=round(row[1], 1),
            batteryVoltage=round(row[2], 2),
            rpm=int(round(row[3])),
        )
        for row in rows
    ]
