from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def local_date(value: datetime, timezone: str) -> date:
    try:
        zone = ZoneInfo(timezone)
    except (ZoneInfoNotFoundError, ValueError):
        zone = ZoneInfo("UTC")
    return value.replace(tzinfo=value.tzinfo or UTC).astimezone(zone).date()
