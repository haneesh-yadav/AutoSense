import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(String(50), nullable=False, index=True)
    trip_id = Column(String(100), unique=True, nullable=False)
    distance_km = Column(Float, nullable=False)
    avg_speed_kph = Column(Float, nullable=False)
    idle_minutes = Column(Float, nullable=False)
    fuel_used_liters = Column(Float, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=False)
