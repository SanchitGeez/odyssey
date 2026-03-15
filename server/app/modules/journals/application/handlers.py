from __future__ import annotations

from fastapi import HTTPException

from app.modules.journals.infrastructure.repository_impl import JournalRepository
from app.modules.journals.presentation.schemas import JournalCreateIn, JournalOut, JournalUpdateIn
from app.shared.db.models import JournalEntry
from app.shared.db.uow import UnitOfWork


class CreateJournalHandler:
    def __init__(self, repo: JournalRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, payload: JournalCreateIn) -> JournalOut:
        row = JournalEntry(user_id=user_id, **payload.model_dump())
        self.repo.create(row)
        self.uow.commit()
        return JournalOut.model_validate(row, from_attributes=True)


class ListJournalsHandler:
    def __init__(self, repo: JournalRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, search: str | None) -> list[JournalOut]:
        return [JournalOut.model_validate(r, from_attributes=True) for r in self.repo.list(user_id, search)]


class GetJournalHandler:
    def __init__(self, repo: JournalRepository) -> None:
        self.repo = repo

    def execute(self, user_id: str, journal_id: str) -> JournalOut:
        row = self.repo.get(journal_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Journal not found")
        return JournalOut.model_validate(row, from_attributes=True)


class UpdateJournalHandler:
    def __init__(self, repo: JournalRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, journal_id: str, payload: JournalUpdateIn) -> JournalOut:
        row = self.repo.get(journal_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Journal not found")
        updates = payload.model_dump(exclude_unset=True)
        if updates:
            row = self.repo.update(row, updates)
            self.uow.commit()
        return JournalOut.model_validate(row, from_attributes=True)


class DeleteJournalHandler:
    def __init__(self, repo: JournalRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, user_id: str, journal_id: str) -> None:
        row = self.repo.get(journal_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Journal not found")
        self.repo.delete(row)
        self.uow.commit()
