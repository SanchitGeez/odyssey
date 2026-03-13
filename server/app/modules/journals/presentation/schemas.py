from __future__ import annotations

from pydantic import BaseModel, Field


class JournalCreateIn(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    content: str = Field(min_length=1)
    tags: list[str] | None = None
    category_tags: list[str] | None = None


class JournalOut(JournalCreateIn):
    id: str
