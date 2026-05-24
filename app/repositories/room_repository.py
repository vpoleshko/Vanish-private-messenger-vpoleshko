from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.entities.room import RoomEntity
from app.mappers.room_mapper import RoomMapper
from app.models.room import Room


class RoomRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, entity: RoomEntity) -> RoomEntity:
        room_model = RoomMapper.to_model(entity)
        self._session.add(room_model)
        await self._session.flush()
        await self._session.refresh(room_model)

        security_model = RoomMapper.security_to_model(entity, room_model.id)
        self._session.add(security_model)
        await self._session.flush()
        await self._session.refresh(security_model)

        room_model.security_settings = security_model
        return RoomMapper.to_entity(room_model)

    async def get_by_code_hash(self, code_hash: str) -> RoomEntity | None:
        result = await self._session.execute(
            select(Room)
            .where(Room.room_code_hash == code_hash)
            .options(selectinload(Room.security_settings))
        )
        model = result.scalar_one_or_none()
        return RoomMapper.to_entity(model) if model else None

    async def get_by_id(self, room_id: int) -> RoomEntity | None:
        result = await self._session.execute(
            select(Room)
            .where(Room.id == room_id)
            .options(selectinload(Room.security_settings))
        )
        model = result.scalar_one_or_none()
        return RoomMapper.to_entity(model) if model else None

    async def delete(self, room_id: int) -> None:
        result = await self._session.execute(
            select(Room).where(Room.id == room_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def save(self, entity: RoomEntity) -> RoomEntity:
        result = await self._session.execute(
            select(Room)
            .where(Room.id == entity.id)
            .options(selectinload(Room.security_settings))
        )
        model = result.scalar_one()
        model.status = entity.status
        model.expires_at = entity.expires_at
        await self._session.flush()
        return RoomMapper.to_entity(model)
