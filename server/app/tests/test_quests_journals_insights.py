from __future__ import annotations

from datetime import date

from app.tests.conftest import auth_headers


def test_quests_journals_and_insights(client):
    headers = auth_headers(client)

    quest = client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Ship MVP", "description": "phase1", "category": "prowess"},
    )
    assert quest.status_code == 200
    quest_id = quest.json()["id"]

    activity = client.post(
        f"/api/v1/quests/{quest_id}/activity",
        headers=headers,
        json={
            "activity_type": "progress_updated",
            "event_date": date.today().isoformat(),
            "payload": {"progress_percent": 25},
        },
    )
    assert activity.status_code == 201

    journal = client.post(
        "/api/v1/journals",
        headers=headers,
        json={
            "title": "Day Log",
            "content": "Good progress",
            "tags": ["reflection"],
            "category_tags": ["prowess", "psyche"],
        },
    )
    assert journal.status_code == 200
    journal_id = journal.json()["id"]

    read = client.get(f"/api/v1/journals/{journal_id}", headers=headers)
    assert read.status_code == 200
    assert read.json()["title"] == "Day Log"

    search = client.get("/api/v1/journals?search=progress", headers=headers)
    assert search.status_code == 200
    assert len(search.json()) == 1

    update = client.patch(
        f"/api/v1/journals/{journal_id}",
        headers=headers,
        json={
            "title": "Day Log Updated",
            "content": "Good progress and clearer next steps",
            "category_tags": ["legacy"],
        },
    )
    assert update.status_code == 200
    assert update.json()["title"] == "Day Log Updated"
    assert update.json()["category_tags"] == ["legacy"]

    insights = client.get("/api/v1/insights/overview", headers=headers)
    assert insights.status_code == 200
    body = insights.json()
    assert "tasks" in body
    assert "quests" in body
    assert "journals" in body


def test_journal_get_and_patch_respects_ownership(client):
    owner_headers = auth_headers(client)
    owner_journal = client.post("/api/v1/journals", headers=owner_headers, json={"content": "private note"})
    assert owner_journal.status_code == 200
    journal_id = owner_journal.json()["id"]

    other_register = client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "password": "Test12345", "timezone": "Asia/Kolkata"},
    )
    assert other_register.status_code in {200, 201}
    other_token = other_register.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    read = client.get(f"/api/v1/journals/{journal_id}", headers=other_headers)
    assert read.status_code == 404

    patch = client.patch(
        f"/api/v1/journals/{journal_id}",
        headers=other_headers,
        json={"content": "tamper"},
    )
    assert patch.status_code == 404


def test_dimension_validation_rejects_invalid_values(client):
    headers = auth_headers(client)

    task = client.post(
        "/api/v1/tasks",
        headers=headers,
        json={
            "title": "Invalid category task",
            "category": "body",
            "task_type": "recurring",
            "schedule_type": "daily",
        },
    )
    assert task.status_code == 422

    quest = client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Invalid category quest", "category": "work"},
    )
    assert quest.status_code == 422

    journal = client.post(
        "/api/v1/journals",
        headers=headers,
        json={"title": "Bad tags", "content": "test", "category_tags": ["mind"]},
    )
    assert journal.status_code == 422


def test_quest_milestones_recalculate_progress_and_log_completion(client):
    headers = auth_headers(client)

    quest = client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Run a marathon", "category": "vitality"},
    )
    assert quest.status_code == 200
    quest_id = quest.json()["id"]

    first = client.post(
        f"/api/v1/quests/{quest_id}/milestones",
        headers=headers,
        json={"title": "Run 5K"},
    )
    second = client.post(
        f"/api/v1/quests/{quest_id}/milestones",
        headers=headers,
        json={"title": "Run 10K"},
    )
    assert first.status_code == 201
    assert second.status_code == 201
    first_id = first.json()["id"]

    updated = client.patch(
        f"/api/v1/quests/{quest_id}/milestones/{first_id}",
        headers=headers,
        json={"is_completed": True},
    )
    assert updated.status_code == 200
    assert updated.json()["is_completed"] is True

    quest_after = client.get("/api/v1/quests", headers=headers)
    assert quest_after.status_code == 200
    assert quest_after.json()[0]["progress_percent"] == 50

    activity = client.get(f"/api/v1/quests/{quest_id}/activity", headers=headers)
    assert activity.status_code == 200
    milestone_events = [entry for entry in activity.json() if entry["activity_type"] == "milestone_completed"]
    assert len(milestone_events) == 1


def test_quest_update_ignores_manual_progress_when_milestones_exist(client):
    headers = auth_headers(client)

    quest = client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Learn piano", "category": "prowess"},
    )
    assert quest.status_code == 200
    quest_id = quest.json()["id"]

    first = client.post(
        f"/api/v1/quests/{quest_id}/milestones",
        headers=headers,
        json={"title": "Learn scales"},
    )
    second = client.post(
        f"/api/v1/quests/{quest_id}/milestones",
        headers=headers,
        json={"title": "Play one song"},
    )
    assert first.status_code == 201
    assert second.status_code == 201

    updated = client.patch(
        f"/api/v1/quests/{quest_id}",
        headers=headers,
        json={"title": "Learn piano fundamentals", "progress_percent": 80},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Learn piano fundamentals"
    assert updated.json()["progress_percent"] == 0


def test_completed_quest_forces_progress_to_hundred_even_with_milestone_updates(client):
    headers = auth_headers(client)

    quest = client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Launch app", "category": "prowess"},
    )
    assert quest.status_code == 200
    quest_id = quest.json()["id"]

    milestone = client.post(
        f"/api/v1/quests/{quest_id}/milestones",
        headers=headers,
        json={"title": "Ship beta"},
    )
    assert milestone.status_code == 201
    milestone_id = milestone.json()["id"]

    completed = client.patch(
        f"/api/v1/quests/{quest_id}",
        headers=headers,
        json={"status": "completed"},
    )
    assert completed.status_code == 200
    assert completed.json()["progress_percent"] == 100

    toggled = client.patch(
        f"/api/v1/quests/{quest_id}/milestones/{milestone_id}",
        headers=headers,
        json={"is_completed": True},
    )
    assert toggled.status_code == 200

    quest_after = client.get("/api/v1/quests", headers=headers)
    assert quest_after.status_code == 200
    assert quest_after.json()[0]["status"] == "completed"
    assert quest_after.json()[0]["progress_percent"] == 100
