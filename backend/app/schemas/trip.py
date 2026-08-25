from datetime import datetime

from pydantic import BaseModel


class TripSummaryResponse(BaseModel):
    tripId: str
    distanceKm: float
    avgSpeedKph: float
    idleMinutes: float
    fuelUsedLiters: float
    startedAt: datetime
    endedAt: datetime

    model_config = {"from_attributes": True}
