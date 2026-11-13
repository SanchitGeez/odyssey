from datetime import UTC, date, datetime, time, timedelta
from unittest.mock import patch

from sqlalchemy import select

from app.api.deps import get_db
from app.main import app
from app.modules.insights.domain.scoring import score_dimensions
from app.shared.core.dates import local_date
from app.shared.db.models import LifeDimension, Task, TaskActivity, TaskActivityType, TaskStatus, TaskType
from app.tests.conftest import auth_headers

START = date(2026, 11, 2)
END = START + timedelta(days=27)


def task(task_id="habit", **kwargs):
    return Task(
        id=task_id, user_id="owner", title=task_id,
        **{
            "category": LifeDimension.vitality, "task_type": TaskType.recurring,
            "status": TaskStatus.active, "schedule_type": "daily",
            "created_at": datetime.combine(START, time.min, UTC),
            "updated_at": datetime.combine(END, time.min, UTC),
            **kwargs,
        },
    )


def response(task_id, day, activity_type=TaskActivityType.done, **kwargs):
    return TaskActivity(task_id=task_id, user_id="owner", event_date=day, activity_type=activity_type, **kwargs)


def scores(tasks, activities=(), start=START, end=END):
    return score_dimensions(tasks, list(activities), start, end, "UTC")


def test_percentages_are_fair_across_different_numbers_of_opportunities():
    daily = task(created_at=datetime.combine(END - timedelta(days=9), time.min, UTC))
    wealth = [task(str(i), category=LifeDimension.wealth, task_type=TaskType.one_time,
                   due_window_type="date", due_date=END) for i in range(5)]
    activity = [response(daily.id, END - timedelta(days=i)) for i in range(8)]
    activity += [response(t.id, END) for t in wealth[:4]]
    result = scores([daily, *wealth], activity)
    assert result["vitality"] == {"completed": 8, "due": 10, "score": 80}
    assert result["wealth"] == {"completed": 4, "due": 5, "score": 80}
    assert result["psyche"] == {"completed": 0, "due": 0, "score": None}


def test_scheduled_days_skips_misses_and_off_schedule_responses():
    habit = task(schedule_type="specific_days", schedule_config={"days_of_week": [0]})
    activity = [response(habit.id, START), response(habit.id, START),
                response(habit.id, START + timedelta(days=1)),
                response(habit.id, START + timedelta(days=7), TaskActivityType.skipped),
                response(habit.id, END + timedelta(days=1))]
    assert scores([habit], activity)["vitality"] == {"completed": 1, "due": 4, "score": 25}
    assert scores([habit])["vitality"] == {"completed": 0, "due": 4, "score": 0}


def test_weekly_targets_count_only_finished_weeks_and_cap_extra_completions():
    habit = task(schedule_type="x_per_week", schedule_config={"target_count": 3})
    # Wednesday to Tuesday includes four Sunday deadlines; the first week starts before the window.
    start = START + timedelta(days=2)
    end = start + timedelta(days=27)
    activity = [response(habit.id, START + timedelta(days=i)) for i in range(7)]
    activity += [response(habit.id, START + timedelta(days=7)), response(habit.id, end)]
    assert scores([habit], activity, start, end)["vitality"] == {"completed": 4, "due": 12, "score": 33}
    habit.schedule_type = "once_per_week"
    assert scores([habit], activity, start, end)["vitality"] == {"completed": 2, "due": 4, "score": 50}


def test_weekly_target_does_not_require_more_completions_than_available_days():
    habit = task(schedule_type="x_per_week", schedule_config={"target_count": 3},
                 created_at=datetime.combine(END, time.min, UTC))
    assert scores([habit], [response(habit.id, END)])["vitality"] == {"completed": 1, "due": 1, "score": 100}


def test_one_time_deadlines_keep_early_credit_and_do_not_count_late_or_undated_work():
    early = task("early", task_type=TaskType.one_time, status=TaskStatus.archived,
                 due_window_type="date", due_date=END,
                 created_at=datetime.combine(START - timedelta(days=10), time.min, UTC),
                 updated_at=datetime.combine(START - timedelta(days=1), time.min, UTC))
    late = task("late", task_type=TaskType.one_time, due_window_type="date", due_date=START)
    window = task("window", task_type=TaskType.one_time, due_window_type="month", window_start=START, window_end=END)
    undated = task("undated", task_type=TaskType.one_time)
    future = task("future", task_type=TaskType.one_time, due_window_type="date", due_date=END + timedelta(days=1))
    activity = [response(early.id, START - timedelta(days=1)), response(late.id, START + timedelta(days=1)),
                response(window.id, END), response(undated.id, END), response(future.id, END)]
    assert scores([early, late, window, undated, future], activity)["vitality"] == {"completed": 2, "due": 3, "score": 67}


def test_archive_and_resume_preserve_history_without_charging_inactive_days():
    habit = task(status=TaskStatus.completed)
    activity = [
        response(habit.id, START + timedelta(days=3), TaskActivityType.status_changed,
                 payload={"previous_status": "active", "status": "archived"}),
        response(habit.id, START + timedelta(days=8), TaskActivityType.status_changed,
                 payload={"previous_status": "archived", "status": "active"}),
        response(habit.id, START + timedelta(days=13), TaskActivityType.status_changed,
                 payload={"previous_status": "active", "status": "completed"}),
        response(habit.id, START), response(habit.id, START + timedelta(days=8)),
    ]
    assert scores([habit], activity)["vitality"] == {"completed": 2, "due": 10, "score": 20}


def test_manually_completed_one_time_task_receives_credit():
    once = task(task_type=TaskType.one_time, due_window_type="date", due_date=END, status=TaskStatus.completed)
    activity = [response(once.id, START, TaskActivityType.status_changed,
                         payload={"previous_status": "active", "status": "completed"})]
    assert scores([once], activity)["vitality"] == {"completed": 1, "due": 1, "score": 100}


def test_resuming_and_archiving_on_the_same_day_keeps_that_days_opportunity():
    habit = task(status=TaskStatus.archived)
    activity = [
        response(habit.id, START, TaskActivityType.status_changed,
                 payload={"previous_status": "active", "status": "archived"}),
        response(habit.id, END, TaskActivityType.status_changed,
                 payload={"previous_status": "archived", "status": "archived", "statuses": ["archived", "active"]}),
        response(habit.id, END),
    ]
    assert scores([habit], activity)["vitality"] == {"completed": 1, "due": 2, "score": 50}


def test_creation_and_legacy_archive_boundaries_use_the_users_timezone():
    habit = task(status=TaskStatus.archived, created_at=datetime(2026, 11, 1, 20, tzinfo=UTC),
                 updated_at=datetime(2026, 11, 2, 20, tzinfo=UTC))
    result = score_dimensions([habit], [], START - timedelta(days=1), END, "Asia/Kolkata")
    assert result["vitality"] == {"completed": 0, "due": 2, "score": 0}
    assert local_date(datetime(2026, 11, 1, 20), "invalid-zone") == date(2026, 11, 1)


def test_dimension_api_window_is_timezone_aware_authenticated_and_owner_scoped(client):
    assert client.get("/api/v1/insights/dimensions").status_code == 401
    headers = auth_headers(client)
    created = client.post("/api/v1/tasks", headers=headers, json={
        "title": "Walk", "category": "vitality", "task_type": "recurring", "schedule_type": "daily",
    })
    task_id = created.json()["id"]
    client.post(f"/api/v1/tasks/by-id/{task_id}/respond", headers=headers,
                json={"response": "done", "event_date": END.isoformat()})
    session = app.dependency_overrides[get_db]()
    db = next(session)
    try:
        row = db.get(Task, task_id)
        row.created_at = datetime.combine(END - timedelta(days=1), time.min, UTC)
        db.commit()
    finally:
        session.close()

    with patch("app.api.v1.insights_routes.datetime") as clock:
        # Already the next day in Kolkata; still END in UTC.
        clock.now.return_value = datetime.combine(END, time(20), UTC)
        result = client.get("/api/v1/insights/dimensions", headers=headers)
    assert result.status_code == 200
    assert result.json()["window"] == {"from_date": START.isoformat(), "to_date": END.isoformat()}
    assert result.json()["dimensions"]["vitality"] == {"completed": 1, "due": 2, "score": 50}

    other = client.post("/api/v1/auth/register", json={"email": "other@example.com", "password": "Test12345"})
    other_headers = {"Authorization": f"Bearer {other.json()['access_token']}"}
    assert all(d["score"] is None for d in client.get("/api/v1/insights/dimensions", headers=other_headers).json()["dimensions"].values())


def test_repeated_status_changes_in_one_day_are_recorded_once(client):
    headers = auth_headers(client)
    created = client.post("/api/v1/tasks", headers=headers, json={
        "title": "Walk", "category": "vitality", "task_type": "recurring", "schedule_type": "daily",
    })
    task_id = created.json()["id"]
    for status in ["archived", "active", "completed"]:
        assert client.patch(f"/api/v1/tasks/by-id/{task_id}", headers=headers, json={"status": status}).status_code == 200
    session = app.dependency_overrides[get_db]()
    db = next(session)
    try:
        changes = db.scalars(select(TaskActivity).where(TaskActivity.task_id == task_id)).all()
        assert len(changes) == 1
        assert changes[0].payload == {"previous_status": "active", "status": "completed",
                                     "statuses": ["active", "archived", "completed"]}
    finally:
        session.close()
