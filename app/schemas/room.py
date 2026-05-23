from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import PrivacyMode, RoomStatus


class RoomCreateRequest(BaseModel):
    privacy_mode: PrivacyMode = PrivacyMode.EXTREME
    ttl_seconds: int = Field(default=1800, ge=60, le=86400)


class RoomCreateResponse(BaseModel):
    room_url: str
    invite_url: str
    expires_at: datetime


class RoomStatusResponse(BaseModel):
    status: RoomStatus
    privacy_mode: PrivacyMode
    expires_at: datetime
    max_participants: int
