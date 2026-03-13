from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, status

from app.modules.identity.infrastructure.repository_impl import IdentityRepository
from app.modules.identity.presentation.schemas import TokenOut
from app.shared.core.config import settings
from app.shared.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.shared.db.uow import UnitOfWork


class RegisterHandler:
    def __init__(self, repo: IdentityRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, email: str, password: str, timezone: str) -> TokenOut:
        if self.repo.get_user_by_email(email):
            raise HTTPException(status_code=409, detail="Email already exists")

        user = self.repo.create_user(email=email, password_hash=hash_password(password), timezone=timezone)
        refresh = generate_refresh_token()
        self.repo.create_refresh_token(user.id, hash_refresh_token(refresh), settings.refresh_token_days)
        self.uow.commit()
        return TokenOut(access_token=create_access_token(user.id), refresh_token=refresh)


class LoginHandler:
    def __init__(self, repo: IdentityRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, email: str, password: str) -> TokenOut:
        user = self.repo.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        refresh = generate_refresh_token()
        self.repo.create_refresh_token(user.id, hash_refresh_token(refresh), settings.refresh_token_days)
        self.uow.commit()
        return TokenOut(access_token=create_access_token(user.id), refresh_token=refresh)


class RefreshHandler:
    def __init__(self, repo: IdentityRepository, uow: UnitOfWork) -> None:
        self.repo = repo
        self.uow = uow

    def execute(self, refresh_token: str) -> TokenOut:
        token_hash = hash_refresh_token(refresh_token)
        row = self.repo.get_active_refresh_token(token_hash)
        if not row or row.expires_at < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        row.revoked_at = datetime.utcnow()
        new_refresh = generate_refresh_token()
        self.repo.create_refresh_token(row.user_id, hash_refresh_token(new_refresh), settings.refresh_token_days)
        self.uow.commit()
        return TokenOut(access_token=create_access_token(row.user_id), refresh_token=new_refresh)
