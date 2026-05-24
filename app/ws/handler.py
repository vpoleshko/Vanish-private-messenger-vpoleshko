import asyncio
import json
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.security import sha256
from app.db.session import AsyncSessionLocal
from app.models.enums import RoomStatus
from app.repositories.invite_repository import InviteRepository
from app.repositories.room_repository import RoomRepository
from app.ws.schemas import (
    ErrorMessage,
    JoinRoomAck,
    JoinRoomMessage,
    PeerInfo,
    PeerJoinedEvent,
)
from app.ws.state import Peer, registry

router = APIRouter()

_ERRORS = {
    "INVALID_JSON":    "Invalid JSON",
    "PROTOCOL_ERROR":  "Protocol error",
    "ROOM_NOT_FOUND":  "Room not found",
    "ROOM_EXPIRED":    "Room has expired",
    "ROOM_FULL":       "Room is full",
    "INVALID_INVITE":  "Invalid or expired invite",
}


def _exp_ts(expires_at: datetime) -> datetime:
    return expires_at if expires_at.tzinfo else expires_at.replace(tzinfo=timezone.utc)


async def _error(ws: WebSocket, code: str) -> None:
    await ws.send_text(ErrorMessage(code=code, message=_ERRORS[code]).model_dump_json())


async def _expire_room(room_id: int) -> None:
    peers = registry.remove_room(room_id)
    async with AsyncSessionLocal() as session:
        await RoomRepository(session).delete(room_id)
        await session.commit()
    msg = json.dumps({"type": "room_destroyed"})
    for p in peers:
        try:
            await p.websocket.send_text(msg)
        except Exception:
            pass


@router.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    peer = None

    try:
        raw = await ws.receive_text()

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            await _error(ws, "INVALID_JSON")
            return

        if data.get("type") != "join_room":
            await _error(ws, "PROTOCOL_ERROR")
            return

        try:
            msg = JoinRoomMessage.model_validate(data)
        except ValidationError:
            await _error(ws, "PROTOCOL_ERROR")
            return

        async with AsyncSessionLocal() as session:
            room_repo   = RoomRepository(session)
            invite_repo = InviteRepository(session)

            room = await room_repo.get_by_code_hash(sha256(msg.room_code))

            if not room:
                await _error(ws, "ROOM_NOT_FOUND")
                return

            if room.status != RoomStatus.ACTIVE:
                await _error(ws, "ROOM_EXPIRED")
                return

            if _exp_ts(room.expires_at) <= datetime.now(timezone.utc):
                await _error(ws, "ROOM_EXPIRED")
                return

            if registry.peer_count(room.id) >= room.max_participants:
                await _error(ws, "ROOM_FULL")
                return

            if not await invite_repo.validate_and_consume(room.id, msg.invite_token):
                await _error(ws, "INVALID_INVITE")
                return

            await session.commit()

            room_id      = room.id
            expires_at   = room.expires_at

        peer_id = f"peer_{secrets.token_hex(4)}"
        peer = Peer(peer_id=peer_id, websocket=ws, public_key=msg.public_key, room_id=room_id)

        active_room = registry.get_or_create(room_id, expires_at)
        other       = registry.other_peer(room_id, peer_id)
        registry.add_peer(active_room, peer)

        if other is None:
            await ws.send_text(JoinRoomAck(
                status="waiting_for_peer",
                peer_id=peer_id,
                room_expires_at=_exp_ts(expires_at).isoformat(),
            ).model_dump_json())
        else:
            await ws.send_text(JoinRoomAck(
                status="connected",
                peer_id=peer_id,
                room_expires_at=_exp_ts(expires_at).isoformat(),
                peer=PeerInfo(peer_id=other.peer_id, public_key=other.public_key),
            ).model_dump_json())

            await other.websocket.send_text(PeerJoinedEvent(
                peer_id=peer_id,
                public_key=msg.public_key,
            ).model_dump_json())

        while True:
            exp = _exp_ts(expires_at)
            time_left = (exp - datetime.now(timezone.utc)).total_seconds()

            if time_left <= 0:
                await _expire_room(room_id)
                peer = None
                break

            try:
                raw = await asyncio.wait_for(ws.receive_text(), timeout=min(time_left, 30.0))
            except asyncio.TimeoutError:
                continue

            if peer is None:
                continue

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            if data.get("type") == "send_message":
                other = registry.other_peer(peer.room_id, peer.peer_id)
                if other:
                    await other.websocket.send_text(json.dumps({
                        "type": "message",
                        "from_peer_id": peer.peer_id,
                        "text": data.get("text", ""),
                    }))

            elif data.get("type") == "destroy_room":
                destroyed = json.dumps({"type": "room_destroyed"})
                peers = registry.remove_room(peer.room_id)
                async with AsyncSessionLocal() as session:
                    await RoomRepository(session).delete(peer.room_id)
                    await session.commit()
                for p in peers:
                    try:
                        await p.websocket.send_text(destroyed)
                    except Exception:
                        pass
                peer = None
                break

    except WebSocketDisconnect:
        pass
    finally:
        if peer:
            other = registry.other_peer(peer.room_id, peer.peer_id)
            registry.remove(ws)
            if other:
                try:
                    await other.websocket.send_text(json.dumps({"type": "peer_left"}))
                except Exception:
                    pass
