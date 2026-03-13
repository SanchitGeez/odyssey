from __future__ import annotations

import os
import tempfile
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.api.deps import get_db
from app.main import app
from app.shared.db.base import Base
from app.shared.db import models  # noqa: F401


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        database_url = f"sqlite:///{tmp.name}"
        engine = create_engine(database_url, connect_args={"check_same_thread": False}, future=True)
        TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)

        Base.metadata.create_all(bind=engine)

        def override_get_db() -> Generator[Session, None, None]:
            db = TestingSessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        with TestClient(app) as c:
            yield c

        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def auth_headers(client: TestClient) -> dict[str, str]:
    payload = {"email": "test@example.com", "password": "Test12345", "timezone": "Asia/Kolkata"}
    res = client.post("/api/v1/auth/register", json=payload)
    if res.status_code not in {200, 201}:
        res = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
