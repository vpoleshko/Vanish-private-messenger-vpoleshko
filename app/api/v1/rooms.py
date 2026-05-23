from fastapi import APIRouter, HTTPException, Request, status

from app.api.deps import RoomServiceDep
from app.schemas.room import RoomCreateRequest, RoomCreateResponse, RoomStatusResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    body: RoomCreateRequest,
    request: Request,
    service: RoomServiceDep,
):
    result = await service.create(body.privacy_mode, body.ttl_seconds)

    base = str(request.base_url).rstrip("/")
    return RoomCreateResponse(
        room_url=f"{base}/r/{result.room_code}",
        invite_url=f"{base}/r/{result.room_code}#invite={result.invite_token}",
        expires_at=result.entity.expires_at,
    )


@router.get("/{room_code}/status", response_model=RoomStatusResponse)
async def room_status(room_code: str, service: RoomServiceDep):
    entity = await service.get_by_code(room_code)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    return RoomStatusResponse(
        status=entity.status,
        privacy_mode=entity.privacy_mode,
        expires_at=entity.expires_at,
        max_participants=entity.max_participants,
    )
