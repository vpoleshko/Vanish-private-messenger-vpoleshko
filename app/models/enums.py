import enum


class RoomStatus(str, enum.Enum):
    ACTIVE = "active"
    LOCKED = "locked"


class PrivacyMode(str, enum.Enum):
    BASIC = "basic"
    HIGH = "high"
    EXTREME = "extreme"


class InviteStatus(str, enum.Enum):
    ACTIVE = "active"
    USED = "used"


class RoomType(str, enum.Enum):
    TEXT  = "text"
    VOICE = "voice"