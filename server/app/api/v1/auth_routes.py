from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.modules.identity.application.handlers import LoginHandler, RefreshHandler, RegisterHandler
from app.modules.identity.infrastructure.repository_impl import IdentityRepository
from app.modules.identity.presentation.schemas import LoginIn, MeOut, RefreshIn, RegisterIn, TokenOut
from app.shared.db.models import User
from app.shared.db.session import get_db
from app.shared.db.uow import UnitOfWork

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    repo = IdentityRepository(db)
    return RegisterHandler(repo, UnitOfWork(db)).execute(payload.email, payload.password, payload.timezone)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    repo = IdentityRepository(db)
    return LoginHandler(repo, UnitOfWork(db)).execute(payload.email, payload.password)


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)) -> TokenOut:
    repo = IdentityRepository(db)
    return RefreshHandler(repo, UnitOfWork(db)).execute(payload.refresh_token)


@router.get("/me", response_model=MeOut)
def me(user: User = Depends(get_current_user)) -> MeOut:
    return MeOut(id=user.id, email=user.email, timezone=user.timezone)
