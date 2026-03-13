from __future__ import annotations


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
