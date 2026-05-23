from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.invite_repository import InviteRepository
from app.repositories.room_repository import RoomRepository


class UnitOfWork:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self.rooms = RoomRepository(session)
        self.invites = InviteRepository(session)

    async def __aenter__(self) -> "UnitOfWork":
        await self._session.begin()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type:
            await self._session.rollback()
        else:
            await self._session.commit()
