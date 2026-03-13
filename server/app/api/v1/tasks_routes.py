from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.modules.tasks.application.handlers import (
    CreateTaskHandler,
    DeleteTaskHandler,
    GetDailyItemsHandler,
    GetTaskHandler,
    ListTasksHandler,
    RespondTaskDailyItemHandler,
    UpdateTaskHandler,
)
from app.modules.tasks.infrastructure.repository_impl import TaskRepository
from app.modules.tasks.presentation.schemas import DailyItemsOut, TaskCreateIn, TaskOut, TaskRespondIn, TaskUpdateIn
from app.shared.db.models import User
from app.shared.db.session import get_db
from app.shared.db.uow import UnitOfWork

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> TaskOut:
    repo = TaskRepository(db)
    return CreateTaskHandler(repo, UnitOfWork(db)).execute(user.id, payload)


@router.get("", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[TaskOut]:
    return ListTasksHandler(TaskRepository(db)).execute(user.id)


@router.get("/by-id/{task_id}", response_model=TaskOut)
def get_task(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> TaskOut:
    return GetTaskHandler(TaskRepository(db)).execute(user.id, task_id)


@router.patch("/by-id/{task_id}", response_model=TaskOut)
def update_task(task_id: str, payload: TaskUpdateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> TaskOut:
    repo = TaskRepository(db)
    return UpdateTaskHandler(repo, UnitOfWork(db)).execute(user.id, task_id, payload)


@router.delete("/by-id/{task_id}", status_code=204, response_class=Response)
def delete_task(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Response:
    repo = TaskRepository(db)
    DeleteTaskHandler(repo, UnitOfWork(db)).execute(user.id, task_id)
    return Response(status_code=204)


@router.get("/daily-items", response_model=DailyItemsOut)
def get_daily_items(
    day: date | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DailyItemsOut:
    target = day or date.today()
    return GetDailyItemsHandler(TaskRepository(db)).execute(user.id, target)


@router.post("/by-id/{task_id}/respond", status_code=201)
def respond_task(
    task_id: str,
    body: TaskRespondIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    repo = TaskRepository(db)
    RespondTaskDailyItemHandler(repo, UnitOfWork(db)).execute(user.id, task_id, body)
    return {"status": "ok"}
