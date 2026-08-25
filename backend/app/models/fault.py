import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class FaultEvent(Base):
    __tablename__ = "fault_events"

    id = Column(String(100), primary_key=True)
    vehicle_id = Column(String(50), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    message = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False)
    triggered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    cleared_at = Column(DateTime(timezone=True), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
