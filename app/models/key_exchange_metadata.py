from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.room import Room


class KeyExchangeMetadata(Base):
    __tablename__ = "key_exchange_metadata"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    room_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("rooms.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    algorithm: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    fingerprint_hash: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    room: Mapped["Room"] = relationship(back_populates="key_exchange_metadata")