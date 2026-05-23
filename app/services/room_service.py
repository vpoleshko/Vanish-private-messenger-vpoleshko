from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import generate_invite_token, generate_room_code, sha256
from app.db.unit_of_work import UnitOfWork
from app.entities.invite import InviteEntity
from app.entities.room import RoomEntity, SecuritySettingsEntity
from app.models.enums import PrivacyMode, RoomStatus


@dataclass
class CreatedRoom:
    entity: RoomEntity
    room_code: str
    invite_token: str


class RoomService:
    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    async def create(self, privacy_mode: PrivacyMode, ttl_seconds: int) -> CreatedRoom:
        room_code = generate_room_code()
        invite_token = generate_invite_token()
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)

        async with self._uow:
            saved = await self._uow.rooms.create(RoomEntity(
                room_code_hash=sha256(room_code),
                expires_at=expires_at,
                status=RoomStatus.ACTIVE,
                privacy_mode=privacy_mode,
                max_participants=settings.max_participants,
                security=_build_security(privacy_mode, ttl_seconds),
            ))

            await self._uow.invites.create(InviteEntity(
                room_id=saved.id,
                invite_token_hash=sha256(invite_token),
                expires_at=expires_at,
            ))

        return CreatedRoom(entity=saved, room_code=room_code, invite_token=invite_token)

    async def get_by_code(self, room_code: str) -> RoomEntity | None:
        async with self._uow:
            return await self._uow.rooms.get_by_code_hash(sha256(room_code))


def _build_security(mode: PrivacyMode, ttl: int) -> SecuritySettingsEntity:
    s = SecuritySettingsEntity(room_ttl_seconds=ttl)
    if mode == PrivacyMode.BASIC:
        s.random_delay_enabled = False
        s.mini_mix_enabled = False
        s.dummy_traffic_enabled = False
    elif mode == PrivacyMode.HIGH:
        s.mini_mix_enabled = False
        s.dummy_traffic_enabled = False
    return s
