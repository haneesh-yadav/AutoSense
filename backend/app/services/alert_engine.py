from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fault import FaultEvent
from app.schemas.telemetry import TelemetryReadingCreate


@dataclass
class AlertResult:
    triggered: list[FaultEvent]
    cleared: list[str]


FAULT_THRESHOLDS = {
    "engine-temp-high": {
        "code": "P0217",
        "message": "Engine Temperature High",
        "severity": "critical",
        "check": lambda r: r.engineTempC > 110,
    },
    "battery-low": {
        "code": "P0562",
        "message": "Low Battery Voltage",
        "severity": "warn",
        "check": lambda r: r.batteryVoltage < 11.8,
    },
    "rpm-high": {
        "code": "P0720",
        "message": "High RPM Detected",
        "severity": "critical",
        "check": lambda r: r.rpm > 7000,
    },
}


async def evaluate_reading(
    reading: TelemetryReadingCreate, vehicle_id: str, db: AsyncSession
) -> AlertResult:
    now = datetime.now(timezone.utc)
    triggered: list[FaultEvent] = []
    cleared: list[str] = []

    for fault_id, config in FAULT_THRESHOLDS.items():
        is_active = config["check"](reading)

        result = await db.execute(
            select(FaultEvent).where(
                FaultEvent.id == fault_id, FaultEvent.vehicle_id == vehicle_id
            )
        )
        existing = result.scalar_one_or_none()

        if is_active:
            if not existing:
                fault = FaultEvent(
                    id=fault_id,
                    vehicle_id=vehicle_id,
                    code=config["code"],
                    message=config["message"],
                    severity=config["severity"],
                    triggered_at=now,
                    active=True,
                )
                db.add(fault)
                triggered.append(fault)
            elif not existing.active:
                existing.active = True
                existing.triggered_at = now
                existing.cleared_at = None
                triggered.append(existing)
        else:
            if existing and existing.active:
                existing.active = False
                existing.cleared_at = now
                cleared.append(fault_id)

    await db.commit()
    return AlertResult(triggered=triggered, cleared=cleared)
