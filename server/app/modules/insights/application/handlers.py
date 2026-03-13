from __future__ import annotations

from datetime import date, timedelta

from app.modules.insights.infrastructure.repository_impl import InsightsRepository


class GetInsightsOverviewHandler:
    def __init__(self, repo: InsightsRepository) -> None:
        self.repo = repo

    def _current_streak(self, user_id: str, today: date) -> int:
        streak = 0
        day = today
        while self.repo.checkin_completed(user_id, day):
            streak += 1
            day -= timedelta(days=1)
        return streak

    def execute(self, user_id: str, from_date: date, to_date: date) -> dict:
        return {
            "window": {"from_date": from_date.isoformat(), "to_date": to_date.isoformat()},
            "current_streak": self._current_streak(user_id, to_date),
            "tasks": {
                "active": self.repo.active_task_count(user_id),
                "done": self.repo.task_done_count(user_id, from_date, to_date),
                "skipped": self.repo.task_skipped_count(user_id, from_date, to_date),
            },
            "quests": {
                "active": self.repo.active_quest_count(user_id),
                "updates": self.repo.quest_update_count(user_id, from_date, to_date),
            },
            "journals": {"entries": self.repo.journal_count(user_id, from_date, to_date)},
        }
