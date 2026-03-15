from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.shared.db.models import LifeDimension


class JournalCreateIn(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    content: str = Field(min_length=1)
    tags: list[str] | None = None
    category_tags: list[LifeDimension] | None = None

    @field_validator("category_tags")
    @classmethod
    def validate_category_tags(cls, value: list[LifeDimension] | None) -> list[LifeDimension] | None:
        if value is None:
            return value
        return list(dict.fromkeys(value))


class JournalUpdateIn(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    tags: list[str] | None = None
    category_tags: list[LifeDimension] | None = None


class JournalOut(JournalCreateIn):
    id: str
    created_at: datetime
    updated_at: datetime
