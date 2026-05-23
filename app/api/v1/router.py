from fastapi import APIRouter

from app.api.v1.rooms import router as rooms_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(rooms_router)
