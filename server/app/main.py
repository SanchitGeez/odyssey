from __future__ import annotations

from fastapi import FastAPI

from app.api.error_handlers import register_error_handlers
from app.api.v1.identity_routes import router as identity_router
from app.api.v1.insights_routes import router as insights_router
from app.api.v1.journals_routes import router as journals_router
from app.api.v1.quests_routes import router as quests_router
from app.api.v1.tasks_routes import router as tasks_router
from app.shared.core.config import settings

app = FastAPI(title=settings.app_name, version=settings.app_version)

register_error_handlers(app)
app.include_router(identity_router)
app.include_router(tasks_router)
app.include_router(quests_router)
app.include_router(journals_router)
app.include_router(insights_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
