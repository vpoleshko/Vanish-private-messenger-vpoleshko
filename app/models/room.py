from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import PrivacyMode, RoomStatus, RoomType

if TYPE_CHECKING:
    from app.models.key_exchange_metadata import KeyExchangeMetadata
    from app.models.room_invite import RoomInvite
    from app.models.room_security_settings import RoomSecuritySettings


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    room_code_hash: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    status: Mapped[RoomStatus] = mapped_column(
        Enum(RoomStatus, name="room_status"),
        nullable=False,
        default=RoomStatus.ACTIVE,
        server_default=RoomStatus.ACTIVE.value,
        index=True,
    )

    privacy_mode: Mapped[PrivacyMode] = mapped_column(
        Enum(PrivacyMode, name="privacy_mode"),
        nullable=False,
        default=PrivacyMode.EXTREME,
        server_default=PrivacyMode.EXTREME.value,
    )

    max_participants: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2,
        server_default="2",
    )

    room_type: Mapped[RoomType] = mapped_column(
        Enum(RoomType, name="room_type"),
        nullable=False,
        default=RoomType.TEXT,
        server_default=RoomType.TEXT.value,
    )

    invites: Mapped[list["RoomInvite"]] = relationship(
        back_populates="room",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    security_settings: Mapped["RoomSecuritySettings"] = relationship(
        back_populates="room",
        cascade="all, delete-orphan",
        passive_deletes=True,
        uselist=False,
    )

    key_exchange_metadata: Mapped["KeyExchangeMetadata | None"] = relationship(
        back_populates="room",
        cascade="all, delete-orphan",
        passive_deletes=True,
        uselist=False,
    )