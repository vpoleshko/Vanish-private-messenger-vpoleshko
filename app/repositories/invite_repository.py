from sqlalchemy.ext.asyncio import AsyncSession

from app.entities.invite import InviteEntity
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
