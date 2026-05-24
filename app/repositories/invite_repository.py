from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import sha256
from app.entities.invite import InviteEntity
from app.models.enums import InviteStatus
from app.models.room_invite import RoomInvite


class InviteRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, entity: InviteEntity) -> InviteEntity:
        model = RoomInvite(
            room_id=entity.room_id,
            invite_token_hash=entity.invite_token_hash,
            expires_at=entity.expires_at,
            max_uses=entity.max_uses,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)

        entity.id = model.id
        entity.created_at = model.created_at
        return entity

    async def validate_and_consume(self, room_id: int, raw_token: str) -> bool:
        result = await self._session.execute(
            select(RoomInvite).where(
                RoomInvite.room_id == room_id,
                RoomInvite.invite_token_hash == sha256(raw_token),
                RoomInvite.status == InviteStatus.ACTIVE,
            )
        )
        invite = result.scalar_one_or_none()
        if not invite:
            return False

        now = datetime.now(timezone.utc)
        if invite.expires_at.replace(tzinfo=timezone.utc) < now:
            invite.status = InviteStatus.USED
            return False

        invite.uses_count += 1
        invite.used_at = now
        invite.status = InviteStatus.USED
        await self._session.flush()
        return True
