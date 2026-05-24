import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.ws.handler import router as ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
logging.getLogger("vanish").setLevel(logging.DEBUG)

_STATIC = Path(__file__).parent / "static"
_INDEX  = _STATIC / "index.html"

app = FastAPI(title="Vanish")
app.include_router(api_router)
app.include_router(ws_router)

# Vite outputs assets/ dir with hashed bundles
if (_STATIC / "assets").exists():
    app.mount("/assets", StaticFiles(directory=_STATIC / "assets"), name="assets")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def index():
    return FileResponse(_INDEX)


@app.get("/r/{room_code}")
async def room_page(room_code: str):
    return FileResponse(_INDEX)
