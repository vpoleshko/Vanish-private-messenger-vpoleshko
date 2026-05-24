from dataclasses import dataclass, field
from datetime import datetime

from fastapi import WebSocket


@dataclass
class Peer:
    peer_id: str
    websocket: WebSocket
    public_key: str
    room_id: int


@dataclass
class ActiveRoom:
    room_id: int
    expires_at: datetime
    peers: dict[str, Peer] = field(default_factory=dict)


class RoomRegistry:
    def __init__(self) -> None:
        self._rooms: dict[int, ActiveRoom] = {}
        self._ws_to_peer: dict[int, Peer] = {}

    def peer_count(self, room_id: int) -> int:
        return len(self._rooms.get(room_id, ActiveRoom(0, datetime.min)).peers)

    def get_or_create(self, room_id: int, expires_at: datetime) -> ActiveRoom:
        if room_id not in self._rooms:
            self._rooms[room_id] = ActiveRoom(room_id=room_id, expires_at=expires_at)
        return self._rooms[room_id]

    def add_peer(self, room: ActiveRoom, peer: Peer) -> None:
        room.peers[peer.peer_id] = peer
        self._ws_to_peer[id(peer.websocket)] = peer

    def other_peer(self, room_id: int, my_peer_id: str) -> Peer | None:
        room = self._rooms.get(room_id)
        if not room:
            return None
        return next((p for pid, p in room.peers.items() if pid != my_peer_id), None)

    def remove(self, ws: WebSocket) -> Peer | None:
        peer = self._ws_to_peer.pop(id(ws), None)
        if not peer:
            return None
        room = self._rooms.get(peer.room_id)
        if room:
            room.peers.pop(peer.peer_id, None)
            if not room.peers:
                self._rooms.pop(peer.room_id, None)
        return peer

    def remove_room(self, room_id: int) -> list["Peer"]:
        room = self._rooms.pop(room_id, None)
        if not room:
            return []
        peers = list(room.peers.values())
        for p in peers:
            self._ws_to_peer.pop(id(p.websocket), None)
        return peers


registry = RoomRegistry()
