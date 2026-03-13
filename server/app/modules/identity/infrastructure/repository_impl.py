from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.shared.db.models import RefreshToken, User


class IdentityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email.lower()))

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.get(User, user_id)

    def create_user(self, email: str, password_hash: str, timezone: str) -> User:
        user = User(email=email.lower(), password_hash=password_hash, timezone=timezone)
        self.db.add(user)
        self.db.flush()
        return user

    def create_refresh_token(self, user_id: str, token_hash: str, refresh_days: int) -> RefreshToken:
        row = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=datetime.now(UTC) + timedelta(days=refresh_days),
        )
        self.db.add(row)
        return row

    def get_active_refresh_token(self, token_hash: str) -> RefreshToken | None:
        return self.db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
        )
