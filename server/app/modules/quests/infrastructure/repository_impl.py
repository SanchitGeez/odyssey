from __future__ import annotations

from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.shared.db.models import Quest, QuestActivity, QuestMilestone


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

    def add_milestone(self, row: QuestMilestone) -> QuestMilestone:
        self.db.add(row)
        self.db.flush()
        return row

    def get_milestone(self, quest_id: str, milestone_id: str, user_id: str) -> QuestMilestone | None:
        return self.db.scalar(
            select(QuestMilestone).where(
                QuestMilestone.id == milestone_id,
                QuestMilestone.quest_id == quest_id,
                QuestMilestone.user_id == user_id,
            )
        )

    def list_milestones(self, quest_id: str, user_id: str) -> list[QuestMilestone]:
        return self.db.scalars(
            select(QuestMilestone)
            .where(QuestMilestone.quest_id == quest_id, QuestMilestone.user_id == user_id)
            .order_by(QuestMilestone.sort_order.asc(), QuestMilestone.created_at.asc())
        ).all()

    def delete_milestone(self, row: QuestMilestone) -> None:
        self.db.delete(row)

    def next_milestone_sort_order(self, quest_id: str, user_id: str) -> int:
        current_max = self.db.scalar(
            select(func.max(QuestMilestone.sort_order)).where(
                QuestMilestone.quest_id == quest_id,
                QuestMilestone.user_id == user_id,
            )
        )
        return int(current_max or -1) + 1
