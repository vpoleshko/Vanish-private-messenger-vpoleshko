from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.invite_repository import InviteRepository
from app.repositories.room_repository import RoomRepository
from app.services.room_service import RoomService

DbSession = Annotated[AsyncSession, Depends(get_db)]


def get_room_repository(db: DbSession) -> RoomRepository:
    return RoomRepository(db)


def get_invite_repository(db: DbSession) -> InviteRepository:
    return InviteRepository(db)


def get_room_service(
    room_repo: Annotated[RoomRepository, Depends(get_room_repository)],
    invite_repo: Annotated[InviteRepository, Depends(get_invite_repository)],
) -> RoomService:
    return RoomService(room_repo, invite_repo)


RoomServiceDep = Annotated[RoomService, Depends(get_room_service)]
