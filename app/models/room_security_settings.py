from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.room import Room


class RoomSecuritySettings(Base):
    __tablename__ = "room_security_settings"

    room_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("rooms.id", ondelete="CASCADE"),
        primary_key=True,
    )

    e2ee_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    padding_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    packet_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1024,
        server_default="1024",
    )

    random_delay_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    min_delay_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1000,
        server_default="1000",
    )

    max_delay_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5000,
        server_default="5000",
    )

    mini_mix_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    batch_window_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3000,
        server_default="3000",
    )

    dummy_traffic_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    room_ttl_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1800,
        server_default="1800",
    )

    room: Mapped["Room"] = relationship(back_populates="security_settings")