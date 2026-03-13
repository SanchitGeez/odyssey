"""phase 1 schema

Revision ID: 0001_phase1_schema
Revises:
Create Date: 2026-03-14
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_phase1_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    task_type = sa.Enum("one_time", "recurring", name="tasktype")
    task_status = sa.Enum("active", "completed", "archived", name="taskstatus")
    task_activity_type = sa.Enum(
        "done",
        "skipped",
        "value_logged",
        "status_changed",
        "deadline_extended",
        "note_added",
        name="taskactivitytype",
    )
    quest_status = sa.Enum("active", "paused", "completed", "archived", name="queststatus")
    quest_activity_type = sa.Enum(
        "progress_updated",
        "status_changed",
        "milestone_added",
        "milestone_completed",
        "note_added",
        name="questactivitytype",
    )

    bind = op.get_bind()
    task_type.create(bind, checkfirst=True)
    task_status.create(bind, checkfirst=True)
    task_activity_type.create(bind, checkfirst=True)
    quest_status.create(bind, checkfirst=True)
    quest_activity_type.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"])

    op.create_table(
        "tasks",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("task_type", task_type, nullable=False),
        sa.Column("status", task_status, nullable=False),
        sa.Column("schedule_type", sa.String(length=32), nullable=True),
        sa.Column("schedule_config", sa.JSON(), nullable=True),
        sa.Column("due_window_type", sa.String(length=32), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("window_start", sa.Date(), nullable=True),
        sa.Column("window_end", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])

    op.create_table(
        "task_activity",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("task_id", sa.String(length=36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("activity_type", task_activity_type, nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("task_id", "event_date", "activity_type", name="uq_task_activity_task_date_type"),
    )
    op.create_index("ix_task_activity_task_id", "task_activity", ["task_id"])
    op.create_index("ix_task_activity_user_id", "task_activity", ["user_id"])
    op.create_index("ix_task_activity_event_date", "task_activity", ["event_date"])
    op.create_index("ix_task_activity_activity_type", "task_activity", ["activity_type"])

    op.create_table(
        "checkin_days",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("for_date", sa.Date(), nullable=False),
        sa.Column("items_total", sa.Integer(), nullable=False),
        sa.Column("items_answered", sa.Integer(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "for_date", name="uq_checkin_user_date"),
    )
    op.create_index("ix_checkin_days_user_id", "checkin_days", ["user_id"])
    op.create_index("ix_checkin_days_for_date", "checkin_days", ["for_date"])

    op.create_table(
        "quests",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=64), nullable=True),
        sa.Column("status", quest_status, nullable=False),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("success_criteria", sa.Text(), nullable=True),
        sa.Column("progress_percent", sa.Numeric(5, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_quests_user_id", "quests", ["user_id"])

    op.create_table(
        "quest_activity",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("quest_id", sa.String(length=36), sa.ForeignKey("quests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("activity_type", quest_activity_type, nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_quest_activity_quest_id", "quest_activity", ["quest_id"])
    op.create_index("ix_quest_activity_user_id", "quest_activity", ["user_id"])
    op.create_index("ix_quest_activity_event_date", "quest_activity", ["event_date"])
    op.create_index("ix_quest_activity_activity_type", "quest_activity", ["activity_type"])

    op.create_table(
        "journal_entries",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("category_tags", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_journal_entries_user_id", "journal_entries", ["user_id"])
    op.create_index("ix_journal_entries_created_at", "journal_entries", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_journal_entries_created_at", table_name="journal_entries")
    op.drop_index("ix_journal_entries_user_id", table_name="journal_entries")
    op.drop_table("journal_entries")

    op.drop_index("ix_quest_activity_activity_type", table_name="quest_activity")
    op.drop_index("ix_quest_activity_event_date", table_name="quest_activity")
    op.drop_index("ix_quest_activity_user_id", table_name="quest_activity")
    op.drop_index("ix_quest_activity_quest_id", table_name="quest_activity")
    op.drop_table("quest_activity")

    op.drop_index("ix_quests_user_id", table_name="quests")
    op.drop_table("quests")

    op.drop_index("ix_checkin_days_for_date", table_name="checkin_days")
    op.drop_index("ix_checkin_days_user_id", table_name="checkin_days")
    op.drop_table("checkin_days")

    op.drop_index("ix_task_activity_activity_type", table_name="task_activity")
    op.drop_index("ix_task_activity_event_date", table_name="task_activity")
    op.drop_index("ix_task_activity_user_id", table_name="task_activity")
    op.drop_index("ix_task_activity_task_id", table_name="task_activity")
    op.drop_table("task_activity")

    op.drop_index("ix_tasks_user_id", table_name="tasks")
    op.drop_table("tasks")

    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_table("users")

    bind = op.get_bind()
    sa.Enum(name="questactivitytype").drop(bind, checkfirst=True)
    sa.Enum(name="queststatus").drop(bind, checkfirst=True)
    sa.Enum(name="taskactivitytype").drop(bind, checkfirst=True)
    sa.Enum(name="taskstatus").drop(bind, checkfirst=True)
    sa.Enum(name="tasktype").drop(bind, checkfirst=True)
