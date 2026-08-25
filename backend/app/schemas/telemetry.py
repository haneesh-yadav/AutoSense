from datetime import datetime

from pydantic import BaseModel, Field


class TelemetryReadingCreate(BaseModel):
    speedKph: float = Field(..., alias="speedKph")
    rpm: int
    engineTempC: float = Field(..., alias="engineTempC")
    batteryVoltage: float = Field(..., alias="batteryVoltage")
    gear: str
    lat: float
    lng: float
    vehicleId: str = Field(default="vehicle-001", alias="vehicleId")
    timestamp: datetime | None = None

    model_config = {"populate_by_name": True}


class TelemetryReadingResponse(BaseModel):
    id: str
    timestamp: datetime
    speedKph: float
    rpm: int
    engineTempC: float
    batteryVoltage: float
    gear: str
    lat: float
    lng: float

    model_config = {"from_attributes": True}


class HistoricalPoint(BaseModel):
    timestamp: datetime
    engineTempC: float
    batteryVoltage: float
    rpm: int
