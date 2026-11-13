from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.shared.core.dates import local_date
from app.shared.db.models import Task, TaskActivity, TaskActivityType, TaskStatus, User


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

    def record_status_change(self, task: Task, previous: TaskStatus) -> None:
        if previous == task.status:
            return
        user = self.db.get(User, task.user_id)
        day = local_date(datetime.now(UTC), user.timezone)
        existing = self.db.scalar(select(TaskActivity).where(
            TaskActivity.task_id == task.id,
            TaskActivity.activity_type == TaskActivityType.status_changed,
            TaskActivity.event_date == day,
        ))
        payload = {"previous_status": previous.value, "status": task.status.value,
                   "statuses": [previous.value, task.status.value]}
        if existing:
            old_payload = existing.payload or {}
            payload["previous_status"] = old_payload.get("previous_status", previous.value)
            payload["statuses"] = list(dict.fromkeys([
                *old_payload.get("statuses", [payload["previous_status"], previous.value]), task.status.value,
            ]))
            existing.payload = payload
        else:
            self.add_activity(TaskActivity(
                task_id=task.id, user_id=task.user_id,
                activity_type=TaskActivityType.status_changed, event_date=day, payload=payload,
            ))
