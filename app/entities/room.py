from dataclasses import dataclass, field
from datetime import datetime

from app.models.enums import PrivacyMode, RoomStatus


@dataclass
class SecuritySettingsEntity:
    e2ee_enabled: bool = True
    padding_enabled: bool = True
    packet_size: int = 1024
    random_delay_enabled: bool = True
    min_delay_ms: int = 1000
    max_delay_ms: int = 5000
    mini_mix_enabled: bool = False
    batch_window_ms: int = 3000
    dummy_traffic_enabled: bool = False
    room_ttl_seconds: int = 1800


@dataclass
class RoomEntity:
    room_code_hash: str
    expires_at: datetime
    privacy_mode: PrivacyMode
    max_participants: int
    security: SecuritySettingsEntity

    id: int | None = None
    created_at: datetime | None = None
    status: RoomStatus = RoomStatus.ACTIVE