from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.unit_of_work import UnitOfWork
from app.services.room_service import RoomService

DbSession = Annotated[AsyncSession, Depends(get_db)]


def get_uow(db: DbSession) -> UnitOfWork:
    return UnitOfWork(db)


def get_room_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> RoomService:
    return RoomService(uow)


RoomServiceDep = Annotated[RoomService, Depends(get_room_service)]
