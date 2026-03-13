from __future__ import annotations

from datetime import date

from fastapi import HTTPException

from app.modules.tasks.infrastructure.repository_impl import TaskRepository
from app.modules.tasks.presentation.schemas import DailyItem, DailyItemsOut, TaskCreateIn, TaskOut, TaskRespondIn, TaskUpdateIn
from app.modules.tasks.domain.services import list_due_tasks, refresh_checkin_day
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
