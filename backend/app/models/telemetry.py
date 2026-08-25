import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    speed_kph = Column(Float, nullable=False)
    rpm = Column(Integer, nullable=False)
    engine_temp_c = Column(Float, nullable=False)
    battery_voltage = Column(Float, nullable=False)
    gear = Column(String(2), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
