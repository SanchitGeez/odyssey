from __future__ import annotations

from datetime import date

from app.tests.conftest import auth_headers


def test_task_crud_and_daily_items(client):
    headers = auth_headers(client)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Workout",
            "description": "30 mins",
            "category": "body",
            "task_type": "recurring",
            "schedule_type": "daily",
            "schedule_config": {},
        },
    )
    assert create.status_code == 200
    task_id = create.json()["id"]

    items = client.get(f"/api/v1/tasks/daily-items?day={date.today().isoformat()}", headers=headers)
    assert items.status_code == 200
    assert items.json()["total"] == 1

    respond = client.post(
        f"/api/v1/tasks/by-id/{task_id}/respond",
        headers=headers,
        json={"response": "done", "event_date": date.today().isoformat(), "payload": {"note": "done"}},
    )
    assert respond.status_code == 201

    items2 = client.get(f"/api/v1/tasks/daily-items?day={date.today().isoformat()}", headers=headers)
    assert items2.status_code == 200
    assert items2.json()["answered"] == 1

    upd = client.patch(f"/api/v1/tasks/by-id/{task_id}", headers=headers, json={"title": "Workout++"})
    assert upd.status_code == 200
    assert upd.json()["title"] == "Workout++"
