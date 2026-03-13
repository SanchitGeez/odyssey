from __future__ import annotations

from datetime import date

from app.tests.conftest import auth_headers


def test_quests_journals_and_insights(client):
    headers = auth_headers(client)

    quest = client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Ship MVP", "description": "phase1", "category": "work"},
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
        json={"title": "Day Log", "content": "Good progress", "tags": ["reflection"]},
    )
    assert journal.status_code == 200

    search = client.get("/api/v1/journals?search=progress", headers=headers)
    assert search.status_code == 200
    assert len(search.json()) == 1

    insights = client.get("/api/v1/insights/overview", headers=headers)
    assert insights.status_code == 200
    body = insights.json()
    assert "tasks" in body
    assert "quests" in body
    assert "journals" in body
