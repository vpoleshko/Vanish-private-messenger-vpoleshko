from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import InviteStatus

if TYPE_CHECKING:
    from app.models.room import Room


class RoomInvite(Base):
    __tablename__ = "room_invites"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    room_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    invite_token_hash: Mapped[str] = mapped_column(
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

    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    max_uses: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    uses_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    status: Mapped[InviteStatus] = mapped_column(
        Enum(InviteStatus, name="invite_status"),
        nullable=False,
        default=InviteStatus.ACTIVE,
        server_default=InviteStatus.ACTIVE.value,
        index=True,
    )

    allowed_key_fingerprint_hash: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
        index=True,
    )

    room: Mapped["Room"] = relationship(back_populates="invites")