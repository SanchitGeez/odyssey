from __future__ import annotations

from datetime import date

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.shared.db.models import CheckinDay, JournalEntry, Quest, QuestActivity, Task, TaskActivity, TaskActivityType


class InsightsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def checkin_completed(self, user_id: str, day: date) -> bool:
        row = self.db.scalar(select(CheckinDay).where(CheckinDay.user_id == user_id, CheckinDay.for_date == day, CheckinDay.completed.is_(True)))
        return bool(row)

    def task_done_count(self, user_id: str, from_date: date, to_date: date) -> int:
        return int(
            self.db.scalar(
                select(func.count(TaskActivity.id)).where(
                    and_(
                        TaskActivity.user_id == user_id,
                        TaskActivity.activity_type == TaskActivityType.done,
                        TaskActivity.event_date >= from_date,
                        TaskActivity.event_date <= to_date,
                    )
                )
            )
            or 0
        )

    def task_skipped_count(self, user_id: str, from_date: date, to_date: date) -> int:
        return int(
            self.db.scalar(
                select(func.count(TaskActivity.id)).where(
                    and_(
                        TaskActivity.user_id == user_id,
                        TaskActivity.activity_type == TaskActivityType.skipped,
                        TaskActivity.event_date >= from_date,
                        TaskActivity.event_date <= to_date,
                    )
                )
            )
            or 0
        )

    def journal_count(self, user_id: str, from_date: date, to_date: date) -> int:
        return int(
            self.db.scalar(
                select(func.count(JournalEntry.id)).where(
                    and_(
                        JournalEntry.user_id == user_id,
                        func.date(JournalEntry.created_at) >= from_date,
                        func.date(JournalEntry.created_at) <= to_date,
                    )
                )
            )
            or 0
        )

    def active_task_count(self, user_id: str) -> int:
        return int(self.db.scalar(select(func.count(Task.id)).where(Task.user_id == user_id)) or 0)

    def active_quest_count(self, user_id: str) -> int:
        return int(self.db.scalar(select(func.count(Quest.id)).where(Quest.user_id == user_id)) or 0)

    def quest_update_count(self, user_id: str, from_date: date, to_date: date) -> int:
        return int(
            self.db.scalar(
                select(func.count(QuestActivity.id)).where(
                    and_(
                        QuestActivity.user_id == user_id,
                        QuestActivity.event_date >= from_date,
                        QuestActivity.event_date <= to_date,
                    )
                )
            )
            or 0
        )
