from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.shared.db.models import CheckinDay, Task, TaskActivity, TaskActivityType, TaskStatus, TaskType

DONE_TYPES = {TaskActivityType.done, TaskActivityType.skipped}


def week_bounds(d: date) -> tuple[date, date]:
    start = d - timedelta(days=d.weekday())
    return start, start + timedelta(days=6)


def task_due_on(db: Session, task: Task, target_date: date) -> bool:
    if task.status != TaskStatus.active:
        return False

    if task.task_type == TaskType.one_time:
        window_type = task.due_window_type or "none"
        if window_type == "date":
            return bool(task.due_date and target_date <= task.due_date)
        if window_type in {"week", "month"}:
            if task.window_start and target_date < task.window_start:
                return False
            if task.window_end and target_date > task.window_end:
                return False
            return True
        return True

    schedule_type = task.schedule_type or "daily"
    config = task.schedule_config or {}

    if schedule_type == "daily":
        return True
    if schedule_type == "specific_days":
        raw_days = config.get("days_of_week", [])
        if not isinstance(raw_days, list):
            return True
        days: list[int] = []
        for raw_day in raw_days:
            try:
                day = int(raw_day)
            except (TypeError, ValueError):
                continue
            if 0 <= day <= 6:
                days.append(day)
        if not days:
            return True
        return target_date.weekday() in days
    if schedule_type in {"x_per_week", "once_per_week"}:
        if schedule_type == "once_per_week":
            target_count = 1
        else:
            raw_target_count = config.get("target_count", 1)
            try:
                target_count = int(raw_target_count)
            except (TypeError, ValueError):
                target_count = 1
            if target_count < 1:
                target_count = 1
        start, end = week_bounds(target_date)
        done_count = db.scalar(
            select(func.count(TaskActivity.id)).where(
                and_(
                    TaskActivity.task_id == task.id,
                    TaskActivity.activity_type == TaskActivityType.done,
                    TaskActivity.event_date >= start,
                    TaskActivity.event_date <= end,
                )
            )
        )
        return int(done_count or 0) < target_count

    return False


def list_due_tasks(db: Session, user_id: str, target_date: date) -> list[Task]:
    tasks = db.scalars(select(Task).where(Task.user_id == user_id, Task.status == TaskStatus.active)).all()
    return [task for task in tasks if task_due_on(db, task, target_date)]


def refresh_checkin_day(db: Session, user_id: str, target_date: date) -> CheckinDay:
    due_tasks = list_due_tasks(db, user_id, target_date)
    total = len(due_tasks)
    answered = 0
    if total > 0:
        answered = int(
            db.scalar(
                select(func.count(TaskActivity.id)).where(
                    and_(
                        TaskActivity.task_id.in_([t.id for t in due_tasks]),
                        TaskActivity.user_id == user_id,
                        TaskActivity.event_date == target_date,
                        TaskActivity.activity_type.in_(list(DONE_TYPES)),
                    )
                )
            )
            or 0
        )

    existing = db.scalar(select(CheckinDay).where(CheckinDay.user_id == user_id, CheckinDay.for_date == target_date))
    completed = total > 0 and answered >= total
    if existing:
        existing.items_total = total
        existing.items_answered = answered
        existing.completed = completed
        existing.completed_at = datetime.now(UTC) if completed else None
        return existing

    row = CheckinDay(
        user_id=user_id,
        for_date=target_date,
        items_total=total,
        items_answered=answered,
        completed=completed,
        completed_at=datetime.now(UTC) if completed else None,
    )
    db.add(row)
    return row
