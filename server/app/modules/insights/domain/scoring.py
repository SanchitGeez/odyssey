from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

from app.modules.tasks.domain.services import scheduled_weekdays, week_bounds, weekly_target
from app.shared.core.dates import local_date
from app.shared.db.models import LifeDimension, Task, TaskActivity, TaskActivityType, TaskStatus, TaskType


def score_dimensions(
    tasks: list[Task], activities: list[TaskActivity], from_date: date, to_date: date, timezone: str,
) -> dict:
    summary = {dimension.value: {"completed": 0, "due": 0, "score": None} for dimension in LifeDimension}
    by_task = defaultdict(list)
    for activity in activities:
        by_task[activity.task_id].append(activity)

    for task in tasks:
        records = by_task[task.id]
        created = local_date(task.created_at, timezone)
        changes = sorted(
            [r for r in records if r.activity_type == TaskActivityType.status_changed and r.payload],
            key=lambda r: r.event_date,
        )

        def active_on(day: date) -> bool:
            if day < created:
                return False
            if not changes:
                # shortcut: legacy inactive tasks have no status history; use their last update.
                return task.status == TaskStatus.active or day <= local_date(task.updated_at, timezone)
            status = changes[0].payload.get("previous_status", TaskStatus.active.value)
            for change in changes:
                if change.event_date > day:
                    break
                next_status = change.payload.get("status", status)
                # Keep the opportunity on an archive day and allow the day of resuming.
                if change.event_date == day:
                    return "active" in change.payload.get("statuses", [status, next_status])
                status = next_status
            return status == "active"

        done = {r.event_date for r in records if r.activity_type == TaskActivityType.done and created <= r.event_date <= to_date}
        completed = due = 0
        if task.task_type == TaskType.one_time:
            deadline = task.due_date if task.due_window_type == "date" else (
                task.window_end if task.due_window_type in {"week", "month"} else None
            )
            done.update(r.event_date for r in changes if "completed" in r.payload.get("statuses", [r.payload.get("status")]) and created <= r.event_date <= to_date)
            if not changes and task.status == TaskStatus.completed:
                done.add(local_date(task.updated_at, timezone))
            finished = bool(deadline and any(day <= deadline for day in done))
            if deadline and created <= deadline and from_date <= deadline <= to_date and (active_on(deadline) or finished):
                due = 1
                completed = int(finished)
        else:
            schedule = task.schedule_type or "daily"
            config = task.schedule_config or {}
            if schedule in {"x_per_week", "once_per_week"}:
                start, end = week_bounds(from_date)
                while end <= to_date:
                    days = {start + timedelta(days=offset) for offset in range(7) if active_on(start + timedelta(days=offset))}
                    target = min(weekly_target(schedule, config), len(days))
                    due += target
                    completed += min(target, len(done & days))
                    start += timedelta(days=7)
                    end += timedelta(days=7)
            elif schedule in {"daily", "specific_days"}:
                weekdays = scheduled_weekdays(config) if schedule == "specific_days" else set(range(7))
                day = from_date
                while day <= to_date:
                    if active_on(day) and day.weekday() in weekdays:
                        due += 1
                        completed += int(day in done)
                    day += timedelta(days=1)
        summary[task.category.value]["due"] += due
        summary[task.category.value]["completed"] += completed

    for dimension in summary.values():
        if dimension["due"]:
            dimension["score"] = int(dimension["completed"] / dimension["due"] * 100 + 0.5)
    return summary
