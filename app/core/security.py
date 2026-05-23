import hashlib
import secrets


def generate_room_code() -> str:
    return secrets.token_urlsafe(16)


def generate_invite_token() -> str:
    return secrets.token_urlsafe(32)


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()
