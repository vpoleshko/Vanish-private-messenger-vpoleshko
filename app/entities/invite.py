from dataclasses import dataclass
from datetime import datetime

from app.models.enums import InviteStatus


@dataclass
class InviteEntity:
    room_id: int
    invite_token_hash: str
    expires_at: datetime

    id: int | None = None
    created_at: datetime | None = None
    used_at: datetime | None = None
    max_uses: int = 1
    uses_count: int = 0
    status: InviteStatus = InviteStatus.ACTIVE
