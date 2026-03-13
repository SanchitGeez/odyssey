from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TaskSchedule:
    schedule_type: str
    raw_config: dict
