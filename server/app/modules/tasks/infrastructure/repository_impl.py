from __future__ import annotations

from datetime import date

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.shared.db.models import Task, TaskActivity, TaskActivityType


class TaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_task(self, task: Task) -> Task:
        self.db.add(task)
        self.db.flush()
        return task

    def list_tasks(self, user_id: str) -> list[Task]:
        return self.db.scalars(select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())).all()

    def get_task(self, task_id: str, user_id: str) -> Task | None:
        return self.db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user_id))

    def delete_task(self, task: Task) -> None:
        self.db.delete(task)

    def find_daily_responses(self, user_id: str, task_ids: list[str], target: date) -> list[TaskActivity]:
        if not task_ids:
            return []
        return self.db.scalars(
            select(TaskActivity).where(
                and_(
                    TaskActivity.user_id == user_id,
                    TaskActivity.task_id.in_(task_ids),
                    TaskActivity.event_date == target,
                    TaskActivity.activity_type.in_([TaskActivityType.done, TaskActivityType.skipped]),
                )
            )
        ).all()

    def get_activities_in_range(self, user_id: str, task_id: str, from_date: date, to_date: date) -> list[TaskActivity]:
        return self.db.scalars(
            select(TaskActivity).where(
                and_(
                    TaskActivity.user_id == user_id,
                    TaskActivity.task_id == task_id,
                    TaskActivity.event_date >= from_date,
                    TaskActivity.event_date <= to_date,
                    TaskActivity.activity_type.in_([TaskActivityType.done, TaskActivityType.skipped]),
                )
            )
        ).all()

    def remove_done_skipped_for_date(self, task_id: str, user_id: str, event_date: date) -> None:
        rows = self.db.scalars(
            select(TaskActivity).where(
                and_(
                    TaskActivity.task_id == task_id,
                    TaskActivity.user_id == user_id,
                    TaskActivity.event_date == event_date,
                    TaskActivity.activity_type.in_([TaskActivityType.done, TaskActivityType.skipped]),
                )
            )
        ).all()
        for row in rows:
            self.db.delete(row)

    def add_activity(self, activity: TaskActivity) -> None:
        self.db.add(activity)
