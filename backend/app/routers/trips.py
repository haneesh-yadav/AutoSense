from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripSummaryResponse

router = APIRouter()


@router.get("", response_model=list[TripSummaryResponse])
async def list_trips(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).order_by(Trip.ended_at.desc()))
    trips = result.scalars().all()
    return [
        TripSummaryResponse(
            tripId=t.trip_id,
            distanceKm=t.distance_km,
            avgSpeedKph=t.avg_speed_kph,
            idleMinutes=t.idle_minutes,
            fuelUsedLiters=t.fuel_used_liters,
            startedAt=t.started_at,
            endedAt=t.ended_at,
        )
        for t in trips
    ]
