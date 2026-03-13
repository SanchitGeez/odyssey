from __future__ import annotations

from datetime import date
from typing import Protocol


class InsightsRepositoryPort(Protocol):
    def checkin_completed(self, user_id: str, day: date) -> bool: ...
