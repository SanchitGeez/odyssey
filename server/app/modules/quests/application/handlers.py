from __future__ import annotations

from fastapi import HTTPException

from app.modules.quests.infrastructure.repository_impl import QuestRepository
from app.modules.quests.presentation.schemas import QuestActivityIn, QuestCreateIn, QuestOut, QuestUpdateIn
from app.shared.db.models import Quest, QuestActivity, QuestActivityType, QuestStatus
from app.shared.db.uow import UnitOfWork


class CreateQuestHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, payload: QuestCreateIn) -> QuestOut:
        row = Quest(user_id=user_id, **payload.model_dump())
        self.repo.create(row)
        self.uow.commit()
        return QuestOut.model_validate(row, from_attributes=True)


class ListQuestsHandler:
    def __init__(self, repo: QuestRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str) -> list[QuestOut]:
        return [QuestOut.model_validate(r, from_attributes=True) for r in self.repo.list(user_id)]


class UpdateQuestHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, quest_id: str, payload: QuestUpdateIn) -> QuestOut:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(row, k, v)
        self.uow.commit()
        return QuestOut.model_validate(row, from_attributes=True)


class DeleteQuestHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, quest_id: str) -> None:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")
        self.repo.delete(row)
        self.uow.commit()


class AddQuestActivityHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, quest_id: str, body: QuestActivityIn) -> None:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")

        self.repo.add_activity(
            QuestActivity(
                quest_id=row.id,
                user_id=user_id,
                activity_type=body.activity_type,
                event_date=body.event_date,
                payload=body.payload,
            )
        )

        payload = body.payload or {}
        if body.activity_type == QuestActivityType.progress_updated and "progress_percent" in payload:
            row.progress_percent = float(payload["progress_percent"])
        if body.activity_type == QuestActivityType.status_changed and "status" in payload:
            row.status = QuestStatus(payload["status"])

        self.uow.commit()


class ListQuestActivityHandler:
    def __init__(self, repo: QuestRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, quest_id: str) -> list[dict]:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")
        return [
            {
                "id": i.id,
                "activity_type": i.activity_type.value,
                "event_date": i.event_date.isoformat(),
                "payload": i.payload,
                "created_at": i.created_at.isoformat(),
            }
            for i in self.repo.list_activity(quest_id, user_id)
        ]
