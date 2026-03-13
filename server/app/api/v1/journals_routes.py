from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.modules.journals.application.handlers import CreateJournalHandler, DeleteJournalHandler, ListJournalsHandler
from app.modules.journals.infrastructure.repository_impl import JournalRepository
from app.modules.journals.presentation.schemas import JournalCreateIn, JournalOut
from app.shared.db.models import User
from app.shared.db.session import get_db
from app.shared.db.uow import UnitOfWork

router = APIRouter(prefix="/api/v1/journals", tags=["journals"])


@router.post("", response_model=JournalOut)
def create_journal(payload: JournalCreateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> JournalOut:
    repo = JournalRepository(db)
    return CreateJournalHandler(repo, UnitOfWork(db)).execute(user.id, payload)


@router.get("", response_model=list[JournalOut])
def list_journals(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[JournalOut]:
    return ListJournalsHandler(JournalRepository(db)).execute(user.id, search)


@router.delete("/{journal_id}", status_code=204, response_class=Response)
def delete_journal(journal_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Response:
    repo = JournalRepository(db)
    DeleteJournalHandler(repo, UnitOfWork(db)).execute(user.id, journal_id)
    return Response(status_code=204)
