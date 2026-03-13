from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.modules.insights.application.handlers import GetInsightsOverviewHandler
from app.modules.insights.infrastructure.repository_impl import InsightsRepository
from app.shared.db.models import User
from app.shared.db.session import get_db

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])


@router.get("/overview")
def get_overview(
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    end = to_date or date.today()
    start = from_date or (end - timedelta(days=29))
    return GetInsightsOverviewHandler(InsightsRepository(db)).execute(user.id, start, end)
