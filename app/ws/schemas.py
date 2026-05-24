from typing import Literal

from pydantic import BaseModel


class JoinRoomMessage(BaseModel):
    type: Literal["join_room"]
    room_code: str
    invite_token: str
    public_key: str


class PeerInfo(BaseModel):
    peer_id: str
    public_key: str


class JoinRoomAck(BaseModel):
    type: Literal["join_room_ack"] = "join_room_ack"
    status: Literal["waiting_for_peer", "connected"]
    peer_id: str
    room_expires_at: str
    peer: PeerInfo | None = None


class PeerJoinedEvent(BaseModel):
    type: Literal["peer_joined"] = "peer_joined"
    peer_id: str
    public_key: str


class ErrorMessage(BaseModel):
    type: Literal["error"] = "error"
    code: str
    message: str
