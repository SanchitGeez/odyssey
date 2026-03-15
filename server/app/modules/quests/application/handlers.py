from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException

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
from app.shared.db.models import Quest, QuestActivity, QuestActivityType, QuestMilestone, QuestStatus
from app.shared.db.uow import UnitOfWork


def _recalculate_progress(repo: QuestRepository, row: Quest, user_id: str) -> None:
    if row.status == QuestStatus.completed:
        row.progress_percent = 100.0
        return
    milestones = repo.list_milestones(row.id, user_id)
    if len(milestones) == 0:
        return
    completed_count = sum(1 for milestone in milestones if milestone.is_completed)
    row.progress_percent = round((completed_count / len(milestones)) * 100, 2)


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
        has_milestones = len(self.repo.list_milestones(quest_id, user_id)) > 0
        for k, v in payload.model_dump(exclude_unset=True).items():
            if k == "progress_percent" and has_milestones:
                continue
            setattr(row, k, v)
        if row.status == QuestStatus.completed:
            row.progress_percent = 100.0
        elif has_milestones:
            _recalculate_progress(self.repo, row, user_id)
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
        has_milestones = len(self.repo.list_milestones(quest_id, user_id)) > 0

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
        if body.activity_type == QuestActivityType.progress_updated and "progress_percent" in payload and not has_milestones:
            row.progress_percent = float(payload["progress_percent"])
        if body.activity_type == QuestActivityType.status_changed and "status" in payload:
            row.status = QuestStatus(payload["status"])
            if row.status == QuestStatus.completed:
                row.progress_percent = 100.0
            elif has_milestones:
                _recalculate_progress(self.repo, row, user_id)

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


class CreateQuestMilestoneHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, quest_id: str, payload: QuestMilestoneCreateIn) -> QuestMilestoneOut:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")

        milestone = self.repo.add_milestone(
            QuestMilestone(
                quest_id=quest_id,
                user_id=user_id,
                title=payload.title.strip(),
                sort_order=self.repo.next_milestone_sort_order(quest_id, user_id),
            )
        )
        _recalculate_progress(self.repo, row, user_id)
        self.uow.commit()
        return QuestMilestoneOut.model_validate(milestone, from_attributes=True)


class ListQuestMilestonesHandler:
    def __init__(self, repo: QuestRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, quest_id: str) -> list[QuestMilestoneOut]:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")
        milestones = self.repo.list_milestones(quest_id, user_id)
        return [QuestMilestoneOut.model_validate(milestone, from_attributes=True) for milestone in milestones]


class UpdateQuestMilestoneHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, quest_id: str, milestone_id: str, payload: QuestMilestoneUpdateIn) -> QuestMilestoneOut:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")
        milestone = self.repo.get_milestone(quest_id, milestone_id, user_id)
        if not milestone:
            raise HTTPException(status_code=404, detail="Milestone not found")

        previous_completed = milestone.is_completed
        update_data = payload.model_dump(exclude_unset=True)

        if "title" in update_data and update_data["title"] is not None:
            milestone.title = update_data["title"].strip()
        if "sort_order" in update_data and update_data["sort_order"] is not None:
            milestone.sort_order = update_data["sort_order"]
        if "is_completed" in update_data and update_data["is_completed"] is not None:
            milestone.is_completed = update_data["is_completed"]
            milestone.completed_at = datetime.utcnow() if milestone.is_completed else None
            if milestone.is_completed and not previous_completed:
                self.repo.add_activity(
                    QuestActivity(
                        quest_id=quest_id,
                        user_id=user_id,
                        activity_type=QuestActivityType.milestone_completed,
                        event_date=datetime.utcnow().date(),
                        payload={"milestone_id": milestone.id, "title": milestone.title},
                    )
                )

        _recalculate_progress(self.repo, row, user_id)
        self.uow.commit()
        return QuestMilestoneOut.model_validate(milestone, from_attributes=True)


class DeleteQuestMilestoneHandler:
    def __init__(self, repo: QuestRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, quest_id: str, milestone_id: str) -> None:
        row = self.repo.get(quest_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quest not found")
        milestone = self.repo.get_milestone(quest_id, milestone_id, user_id)
        if not milestone:
            raise HTTPException(status_code=404, detail="Milestone not found")
        self.repo.delete_milestone(milestone)
        _recalculate_progress(self.repo, row, user_id)
        self.uow.commit()
