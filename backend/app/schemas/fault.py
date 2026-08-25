from datetime import datetime

from pydantic import BaseModel


class FaultAlertResponse(BaseModel):
    id: str
    code: str
    message: str
    severity: str
    triggeredAt: datetime
    active: bool

    model_config = {"from_attributes": True}
