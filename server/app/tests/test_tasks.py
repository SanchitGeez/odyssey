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


def test_task_heatmap_returns_done_skipped_and_missed(client):
    headers = auth_headers(client)
    start = date.today() - timedelta(days=4)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Heatmap Daily",
            "description": "Daily status map",
            "category": "legacy",
            "task_type": "recurring",
            "schedule_type": "daily",
            "schedule_config": {},
        },
    )
    assert create.status_code == 200
    task_id = create.json()["id"]

    done_day = start
    skipped_day = start + timedelta(days=1)
    end = start + timedelta(days=3)

    done = client.post(
        f"/api/v1/tasks/by-id/{task_id}/respond",
        headers=headers,
        json={"response": "done", "event_date": done_day.isoformat()},
    )
    assert done.status_code == 201

    skipped = client.post(
        f"/api/v1/tasks/by-id/{task_id}/respond",
        headers=headers,
        json={"response": "skipped", "event_date": skipped_day.isoformat()},
    )
    assert skipped.status_code == 201

    heatmap = client.get(
        f"/api/v1/tasks/by-id/{task_id}/heatmap?from_date={start.isoformat()}&to_date={end.isoformat()}",
        headers=headers,
    )
    assert heatmap.status_code == 200
    payload = heatmap.json()

    assert payload["dates"][done_day.isoformat()] == "done"
    assert payload["dates"][skipped_day.isoformat()] == "skipped"
    assert payload["dates"][(skipped_day + timedelta(days=1)).isoformat()] == "missed"
    assert payload["dates"][end.isoformat()] == "missed"
    assert payload["summary"] == {"done": 1, "skipped": 1, "missed": 2, "not_due": 0}


def test_task_heatmap_marks_not_due_days_for_specific_schedule(client):
    headers = auth_headers(client)
    monday = _next_weekday(date.today() - timedelta(days=14), 0)
    wednesday = monday + timedelta(days=2)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Monday Only",
            "description": "Specific-days heatmap",
            "category": "alliance",
            "task_type": "recurring",
            "schedule_type": "specific_days",
            "schedule_config": {"days_of_week": [0]},
        },
    )
    assert create.status_code == 200
    task_id = create.json()["id"]

    done = client.post(
        f"/api/v1/tasks/by-id/{task_id}/respond",
        headers=headers,
        json={"response": "done", "event_date": monday.isoformat()},
    )
    assert done.status_code == 201

    heatmap = client.get(
        f"/api/v1/tasks/by-id/{task_id}/heatmap?from_date={monday.isoformat()}&to_date={wednesday.isoformat()}",
        headers=headers,
    )
    assert heatmap.status_code == 200
    payload = heatmap.json()
    assert payload["dates"][monday.isoformat()] == "done"
    assert payload["dates"][(monday + timedelta(days=1)).isoformat()] == "not_due"
    assert payload["dates"][wednesday.isoformat()] == "not_due"


def test_task_heatmap_rejects_invalid_date_ranges(client):
    headers = auth_headers(client)

    create = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Range validation",
            "description": "Heatmap range checks",
            "category": "wealth",
            "task_type": "recurring",
            "schedule_type": "daily",
            "schedule_config": {},
        },
    )
    assert create.status_code == 200
    task_id = create.json()["id"]

    reversed_range = client.get(
        f"/api/v1/tasks/by-id/{task_id}/heatmap?from_date=2026-03-10&to_date=2026-03-01",
        headers=headers,
    )
    assert reversed_range.status_code == 400

    oversized_range = client.get(
        f"/api/v1/tasks/by-id/{task_id}/heatmap?from_date=2024-01-01&to_date=2026-01-05",
        headers=headers,
    )
    assert oversized_range.status_code == 400
