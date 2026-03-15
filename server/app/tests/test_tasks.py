from __future__ import annotations

from datetime import date, timedelta

from app.tests.conftest import auth_headers


def _next_weekday(start: date, weekday: int) -> date:
    return start + timedelta(days=(weekday - start.weekday()) % 7)


def test_task_crud_and_daily_items(client):
    headers = auth_headers(client)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Workout",
            "description": "30 mins",
            "category": "vitality",
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


def test_specific_days_respects_selected_weekdays(client):
    headers = auth_headers(client)
    monday = _next_weekday(date.today(), 0)
    tuesday = monday + timedelta(days=1)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Mon-Thu Habit",
            "description": "Only specific days",
            "category": "vitality",
            "task_type": "recurring",
            "schedule_type": "specific_days",
            "schedule_config": {"days_of_week": [0, 3]},
        },
    )
    assert create.status_code == 200

    monday_items = client.get(f"/api/v1/tasks/daily-items?day={monday.isoformat()}", headers=headers)
    assert monday_items.status_code == 200
    assert monday_items.json()["total"] == 1

    tuesday_items = client.get(f"/api/v1/tasks/daily-items?day={tuesday.isoformat()}", headers=headers)
    assert tuesday_items.status_code == 200
    assert tuesday_items.json()["total"] == 0


def test_specific_days_missing_config_falls_back_to_daily(client):
    headers = auth_headers(client)
    today = date.today()

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Misconfigured specific-days task",
            "description": "No days configured",
            "category": "psyche",
            "task_type": "recurring",
            "schedule_type": "specific_days",
            "schedule_config": {},
        },
    )
    assert create.status_code == 200

    items = client.get(f"/api/v1/tasks/daily-items?day={today.isoformat()}", headers=headers)
    assert items.status_code == 200
    assert items.json()["total"] == 1


def test_x_per_week_missing_target_defaults_to_one(client):
    headers = auth_headers(client)
    monday = _next_weekday(date.today(), 0)
    tuesday = monday + timedelta(days=1)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Weekly target missing",
            "description": "Should default to one completion",
            "category": "prowess",
            "task_type": "recurring",
            "schedule_type": "x_per_week",
            "schedule_config": {},
        },
    )
    assert create.status_code == 200
    task_id = create.json()["id"]

    monday_items = client.get(f"/api/v1/tasks/daily-items?day={monday.isoformat()}", headers=headers)
    assert monday_items.status_code == 200
    assert monday_items.json()["total"] == 1

    respond = client.post(
        f"/api/v1/tasks/by-id/{task_id}/respond",
        headers=headers,
        json={"response": "done", "event_date": monday.isoformat(), "payload": {"note": "done"}},
    )
    assert respond.status_code == 201

    tuesday_items = client.get(f"/api/v1/tasks/daily-items?day={tuesday.isoformat()}", headers=headers)
    assert tuesday_items.status_code == 200
    assert tuesday_items.json()["total"] == 0


def test_once_per_week_disappears_after_one_completion(client):
    headers = auth_headers(client)
    monday = _next_weekday(date.today(), 0)
    tuesday = monday + timedelta(days=1)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Once Weekly",
            "description": "Only once each week",
            "category": "wealth",
            "task_type": "recurring",
            "schedule_type": "once_per_week",
        },
    )
    assert create.status_code == 200
    task_id = create.json()["id"]

    monday_items = client.get(f"/api/v1/tasks/daily-items?day={monday.isoformat()}", headers=headers)
    assert monday_items.status_code == 200
    assert monday_items.json()["total"] == 1

    respond = client.post(
        f"/api/v1/tasks/by-id/{task_id}/respond",
        headers=headers,
        json={"response": "done", "event_date": monday.isoformat(), "payload": {"note": "done"}},
    )
    assert respond.status_code == 201

    tuesday_items = client.get(f"/api/v1/tasks/daily-items?day={tuesday.isoformat()}", headers=headers)
    assert tuesday_items.status_code == 200
    assert tuesday_items.json()["total"] == 0
