from __future__ import annotations

from datetime import date, timedelta

from fastapi import HTTPException

from app.modules.tasks.infrastructure.repository_impl import TaskRepository
from app.modules.tasks.domain.services import list_due_tasks, refresh_checkin_day, task_due_on
from app.modules.tasks.presentation.schemas import (
    DailyItem,
    DailyItemsOut,
    TaskCreateIn,
    TaskHeatmapOut,
    TaskHeatmapSummary,
    TaskOut,
    TaskRespondIn,
    TaskUpdateIn,
)
from app.shared.db.models import Task, TaskActivity, TaskActivityType, TaskStatus, TaskType
from app.shared.db.uow import UnitOfWork


class CreateTaskHandler:
    def __init__(self, repo: TaskRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, payload: TaskCreateIn) -> TaskOut:
        task = Task(user_id=user_id, **payload.model_dump())
        self.repo.create_task(task)
        self.uow.commit()
        return TaskOut.model_validate(task, from_attributes=True)


class ListTasksHandler:
    def __init__(self, repo: TaskRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str) -> list[TaskOut]:
        return [TaskOut.model_validate(t, from_attributes=True) for t in self.repo.list_tasks(user_id)]


class GetTaskHandler:
    def __init__(self, repo: TaskRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, task_id: str) -> TaskOut:
        task = self.repo.get_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskOut.model_validate(task, from_attributes=True)


class UpdateTaskHandler:
    def __init__(self, repo: TaskRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, task_id: str, payload: TaskUpdateIn) -> TaskOut:
        task = self.repo.get_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(task, k, v)
        self.uow.commit()
        return TaskOut.model_validate(task, from_attributes=True)


class DeleteTaskHandler:
    def __init__(self, repo: TaskRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, task_id: str) -> None:
        task = self.repo.get_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        self.repo.delete_task(task)
        self.uow.commit()


class GetDailyItemsHandler:
    def __init__(self, repo: TaskRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, target: date) -> DailyItemsOut:
        due = list_due_tasks(self.repo.db, user_id, target)
        responses = {r.task_id: r.activity_type.value for r in self.repo.find_daily_responses(user_id, [t.id for t in due], target)}
        items = [
            DailyItem(task_id=t.id, title=t.title, category=t.category, status=t.status.value, response=responses.get(t.id))
            for t in due
        ]
        answered = len(responses)
        total = len(items)
        return DailyItemsOut(date=target, total=total, answered=answered, pending=max(total - answered, 0), items=items)


class RespondTaskDailyItemHandler:
    def __init__(self, repo: TaskRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, task_id: str, body: TaskRespondIn) -> None:
        if body.response not in {TaskActivityType.done, TaskActivityType.skipped, TaskActivityType.value_logged}:
            raise HTTPException(status_code=400, detail="Response must be done, skipped, or value_logged")

        task = self.repo.get_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if body.response in {TaskActivityType.done, TaskActivityType.skipped}:
            self.repo.remove_done_skipped_for_date(task_id, user_id, body.event_date)

        self.repo.add_activity(
            TaskActivity(
                task_id=task.id,
                user_id=user_id,
                activity_type=body.response,
                event_date=body.event_date,
                payload=body.payload,
            )
        )

        if task.task_type == TaskType.one_time and body.response == TaskActivityType.done:
            task.status = TaskStatus.archived

        refresh_checkin_day(self.repo.db, user_id, body.event_date)
        self.uow.commit()


class GetTaskHeatmapHandler:
    def __init__(self, repo: TaskRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, task_id: str, from_date: date, to_date: date) -> TaskHeatmapOut:
        if from_date > to_date:
            raise HTTPException(status_code=400, detail="from_date must be on or before to_date")
        if (to_date - from_date).days > 366:
            raise HTTPException(status_code=400, detail="Date range cannot exceed 366 days")

        task = self.repo.get_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        activities = self.repo.get_activities_in_range(user_id, task_id, from_date, to_date)
        activity_by_date: dict[date, TaskActivityType] = {}
        for activity in activities:
            existing = activity_by_date.get(activity.event_date)
            if existing == TaskActivityType.done:
                continue
            if activity.activity_type == TaskActivityType.done:
                activity_by_date[activity.event_date] = TaskActivityType.done
            elif activity.activity_type == TaskActivityType.skipped and existing is None:
                activity_by_date[activity.event_date] = TaskActivityType.skipped

        today = date.today()
        summary = {"done": 0, "skipped": 0, "missed": 0, "not_due": 0}
        statuses: dict[date, str] = {}
        cursor = from_date
        while cursor <= to_date:
            if not task_due_on(self.repo.db, task, cursor):
                status = "not_due"
            else:
                activity = activity_by_date.get(cursor)
                if activity == TaskActivityType.done:
                    status = "done"
                elif activity == TaskActivityType.skipped:
                    status = "skipped"
                elif cursor < today:
                    status = "missed"
                else:
                    status = "not_due"
            summary[status] += 1
            statuses[cursor] = status
            cursor += timedelta(days=1)

        return TaskHeatmapOut(
            task_id=task.id,
            from_date=from_date,
            to_date=to_date,
            dates=statuses,
            summary=TaskHeatmapSummary(**summary),
        )
