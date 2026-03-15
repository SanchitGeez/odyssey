from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.modules.quests.application.handlers import (
    AddQuestActivityHandler,
    CreateQuestHandler,
    CreateQuestMilestoneHandler,
    DeleteQuestHandler,
    DeleteQuestMilestoneHandler,
    ListQuestActivityHandler,
    ListQuestMilestonesHandler,
    ListQuestsHandler,
    UpdateQuestMilestoneHandler,
    UpdateQuestHandler,
)
from app.modules.quests.infrastructure.repository_impl import QuestRepository
from app.modules.quests.presentation.schemas import (
    QuestActivityIn,
    QuestCreateIn,
    QuestMilestoneCreateIn,
    QuestMilestoneOut,
    QuestMilestoneUpdateIn,
    QuestOut,
    QuestUpdateIn,
)
from app.shared.db.models import User
from app.shared.db.session import get_db
from app.shared.db.uow import UnitOfWork

router = APIRouter(prefix="/api/v1/quests", tags=["quests"])


@router.post("", response_model=QuestOut)
def create_quest(payload: QuestCreateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> QuestOut:
    repo = QuestRepository(db)
    return CreateQuestHandler(repo, UnitOfWork(db)).execute(user.id, payload)


@router.get("", response_model=list[QuestOut])
def list_quests(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[QuestOut]:
    return ListQuestsHandler(QuestRepository(db)).execute(user.id)


@router.patch("/{quest_id}", response_model=QuestOut)
def update_quest(quest_id: str, payload: QuestUpdateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> QuestOut:
    repo = QuestRepository(db)
    return UpdateQuestHandler(repo, UnitOfWork(db)).execute(user.id, quest_id, payload)


@router.delete("/{quest_id}", status_code=204, response_class=Response)
def delete_quest(quest_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Response:
    repo = QuestRepository(db)
    DeleteQuestHandler(repo, UnitOfWork(db)).execute(user.id, quest_id)
    return Response(status_code=204)


@router.post("/{quest_id}/activity", status_code=201)
def add_quest_activity(
    quest_id: str,
    body: QuestActivityIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    repo = QuestRepository(db)
    AddQuestActivityHandler(repo, UnitOfWork(db)).execute(user.id, quest_id, body)
    return {"status": "ok"}


@router.get("/{quest_id}/activity")
def list_quest_activity(quest_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[dict]:
    return ListQuestActivityHandler(QuestRepository(db)).execute(user.id, quest_id)


@router.get("/{quest_id}/milestones", response_model=list[QuestMilestoneOut])
def list_quest_milestones(quest_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[QuestMilestoneOut]:
    return ListQuestMilestonesHandler(QuestRepository(db)).execute(user.id, quest_id)


@router.post("/{quest_id}/milestones", response_model=QuestMilestoneOut, status_code=201)
def create_quest_milestone(
    quest_id: str,
    body: QuestMilestoneCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> QuestMilestoneOut:
    repo = QuestRepository(db)
    return CreateQuestMilestoneHandler(repo, UnitOfWork(db)).execute(user.id, quest_id, body)


@router.patch("/{quest_id}/milestones/{milestone_id}", response_model=QuestMilestoneOut)
def update_quest_milestone(
    quest_id: str,
    milestone_id: str,
    body: QuestMilestoneUpdateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> QuestMilestoneOut:
    repo = QuestRepository(db)
    return UpdateQuestMilestoneHandler(repo, UnitOfWork(db)).execute(user.id, quest_id, milestone_id, body)


@router.delete("/{quest_id}/milestones/{milestone_id}", status_code=204, response_class=Response)
def delete_quest_milestone(
    quest_id: str,
    milestone_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    repo = QuestRepository(db)
    DeleteQuestMilestoneHandler(repo, UnitOfWork(db)).execute(user.id, quest_id, milestone_id)
    return Response(status_code=204)
