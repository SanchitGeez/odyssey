from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, Field

from app.shared.db.models import LifeDimension, QuestActivityType, QuestStatus


class QuestCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    category: LifeDimension | None = None
    target_date: date | None = None
    success_criteria: str | None = None


class QuestOut(QuestCreateIn):
    id: str
    status: QuestStatus
    progress_percent: float | None = None


class QuestUpdateIn(BaseModel):
    title: str | None = None
    description: str | None = None
    category: LifeDimension | None = None
    status: QuestStatus | None = None
    target_date: date | None = None
    success_criteria: str | None = None
    progress_percent: float | None = None


class QuestActivityIn(BaseModel):
    activity_type: QuestActivityType
    event_date: date
    payload: dict[str, Any] | None = None
