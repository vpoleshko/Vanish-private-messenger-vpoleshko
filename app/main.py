from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(title="Vanish")
app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
