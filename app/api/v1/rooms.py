from fastapi import APIRouter, Request, status

from app.api.deps import RoomServiceDep
from app.schemas.room import RoomCreateRequest, RoomCreateResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_room(body: RoomCreateRequest, request: Request, service: RoomServiceDep):
    result = await service.create(body.privacy_mode, body.ttl_seconds, body.room_type)
    base = str(request.base_url).rstrip("/")
    return RoomCreateResponse(
        my_url=f"{base}/r/{result.room_code}#invite={result.my_invite_token}",
        invite_url=f"{base}/r/{result.room_code}#invite={result.peer_invite_token}",
        expires_at=result.entity.expires_at,
    )
