from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

from app.shared.db.models import LifeDimension


class JournalCreateIn(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    content: str = Field(min_length=1)
    tags: list[str] | None = None
    category_tags: list[str] | None = None

    @field_validator("category_tags")
    @classmethod
    def validate_category_tags(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return value
        valid_dimensions = {dimension.value for dimension in LifeDimension}
        for tag in value:
            if tag not in valid_dimensions:
                raise ValueError(f"Invalid category: {tag}")
        return value


class JournalOut(JournalCreateIn):
    id: str
