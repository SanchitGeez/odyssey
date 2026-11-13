from __future__ import annotations

from datetime import UTC, datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.modules.identity.application.handlers import RefreshHandler
from app.shared.core.security import hash_refresh_token


def test_register_login_me_refresh(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "Strong123", "timezone": "Asia/Kolkata"},
    )
    assert reg.status_code == 200
    body = reg.json()
    assert "access_token" in body
    assert "refresh_token" in body

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"

    login = client.post("/api/v1/auth/login", json={"email": "alice@example.com", "password": "Strong123"})
    assert login.status_code == 200

    refresh = client.post("/api/v1/auth/refresh", json={"refresh_token": login.json()["refresh_token"]})
    assert refresh.status_code == 200


# SQLite strips timezone information from DateTime(timezone=True), while
# PostgreSQL returns aware values. Both must keep the same expiry semantics.

@pytest.mark.parametrize("zone", [None, UTC, timezone(timedelta(hours=5, minutes=30))], ids=["sqlite-naive", "postgres-aware", "aware-non-utc"])
@pytest.mark.parametrize("expired", [False, True], ids=["valid", "expired"])
def test_refresh_expiry_accepts_aware_and_naive_utc(zone, expired):
    expires_at = datetime.now(UTC) + timedelta(minutes=-30 if expired else 30)
    expires_at = expires_at.astimezone(zone) if zone is not None else expires_at.replace(tzinfo=None)
    row = SimpleNamespace(user_id="refresh-test-user", expires_at=expires_at, revoked_at=None)
    repo = MagicMock()
    repo.get_active_refresh_token.return_value = row
    uow = MagicMock()

    if expired:
        with pytest.raises(HTTPException) as error:
            RefreshHandler(repo, uow).execute("original-refresh-token")
        assert error.value.status_code == 401
        assert row.revoked_at is None
        repo.create_refresh_token.assert_not_called()
        uow.commit.assert_not_called()
    else:
        tokens = RefreshHandler(repo, uow).execute("original-refresh-token")
        assert tokens.access_token
        assert tokens.refresh_token != "original-refresh-token"
        assert row.revoked_at.tzinfo == UTC
        repo.create_refresh_token.assert_called_once()
        assert repo.create_refresh_token.call_args.args[:2] == (row.user_id, hash_refresh_token(tokens.refresh_token))
        uow.commit.assert_called_once()
    assert row.expires_at == expires_at
