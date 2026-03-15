from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.shared.db.models import JournalEntry


class JournalRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, row: JournalEntry) -> JournalEntry:
        self.db.add(row)
        self.db.flush()
        return row

    def list(self, user_id: str, search: str | None = None) -> list[JournalEntry]:
        stmt = select(JournalEntry).where(JournalEntry.user_id == user_id)
        if search:
            stmt = stmt.where(JournalEntry.content.ilike(f"%{search}%"))
        return self.db.scalars(stmt.order_by(JournalEntry.created_at.desc())).all()

    def get(self, journal_id: str, user_id: str) -> JournalEntry | None:
        return self.db.scalar(select(JournalEntry).where(JournalEntry.id == journal_id, JournalEntry.user_id == user_id))

    def update(self, row: JournalEntry, fields: dict[str, object]) -> JournalEntry:
        for key, value in fields.items():
            setattr(row, key, value)
        self.db.flush()
        return row

    def delete(self, row: JournalEntry) -> None:
        self.db.delete(row)
