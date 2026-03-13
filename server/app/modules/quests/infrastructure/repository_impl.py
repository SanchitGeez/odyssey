from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.shared.db.models import Quest, QuestActivity


class QuestRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, row: Quest) -> Quest:
        self.db.add(row)
        self.db.flush()
        return row

    def list(self, user_id: str) -> list[Quest]:
        return self.db.scalars(select(Quest).where(Quest.user_id == user_id).order_by(Quest.created_at.desc())).all()

    def get(self, quest_id: str, user_id: str) -> Quest | None:
        return self.db.scalar(select(Quest).where(Quest.id == quest_id, Quest.user_id == user_id))

    def delete(self, row: Quest) -> None:
        self.db.delete(row)

    def add_activity(self, row: QuestActivity) -> None:
        self.db.add(row)

    def list_activity(self, quest_id: str, user_id: str) -> list[QuestActivity]:
        return self.db.scalars(
            select(QuestActivity)
            .where(QuestActivity.quest_id == quest_id, QuestActivity.user_id == user_id)
            .order_by(QuestActivity.event_date.desc())
        ).all()
