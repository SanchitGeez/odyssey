from __future__ import annotations

from datetime import date, datetime
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
    event_date: date = Field(default_factory=date.today)
    payload: dict[str, Any] | None = None


class QuestMilestoneCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class QuestMilestoneUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    is_completed: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)


class QuestMilestoneOut(BaseModel):
    id: str
    quest_id: str
    title: str
    is_completed: bool
    completed_at: datetime | None
    sort_order: int
    created_at: datetime
