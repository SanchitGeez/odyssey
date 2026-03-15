from __future__ import annotations

from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.shared.db.models import LifeDimension, TaskActivityType, TaskStatus, TaskType


class TaskCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    category: LifeDimension
    task_type: TaskType
    schedule_type: str | None = None
    schedule_config: dict[str, Any] | None = None
    due_window_type: str | None = None
    due_date: date | None = None
    window_start: date | None = None
    window_end: date | None = None


class TaskOut(TaskCreateIn):
    id: str
    status: TaskStatus


class TaskUpdateIn(BaseModel):
    title: str | None = None
    description: str | None = None
    category: LifeDimension | None = None
    status: TaskStatus | None = None
    schedule_type: str | None = None
    schedule_config: dict[str, Any] | None = None
    due_window_type: str | None = None
    due_date: date | None = None
    window_start: date | None = None
    window_end: date | None = None


class DailyItem(BaseModel):
    task_id: str
    title: str
    category: LifeDimension
    status: str
    response: str | None = None


class DailyItemsOut(BaseModel):
    date: date
    total: int
    answered: int
    pending: int
    items: list[DailyItem]


class TaskRespondIn(BaseModel):
    response: TaskActivityType
    event_date: date
    payload: dict[str, Any] | None = None


HeatmapStatus = Literal["done", "skipped", "missed", "not_due"]


class TaskHeatmapSummary(BaseModel):
    done: int
    skipped: int
    missed: int
    not_due: int


class TaskHeatmapOut(BaseModel):
    task_id: str
    from_date: date
    to_date: date
    dates: dict[date, HeatmapStatus]
    summary: TaskHeatmapSummary
