from fastapi import FastAPI

app = FastAPI(title="Vanish")


@app.get("/health")
async def health():
    return {"status": "ok"}
