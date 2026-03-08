from fastapi import FastAPI

app = FastAPI(title="Odyssey Backend", version="0.1.0")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
