"""add quest milestones

Revision ID: 0003_quest_milestones
Revises: 0002_dimension_enums
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_quest_milestones"
down_revision = "0002_dimension_enums"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quest_milestones",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("quest_id", sa.String(length=36), sa.ForeignKey("quests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_quest_milestones_quest_id", "quest_milestones", ["quest_id"])
    op.create_index("ix_quest_milestones_user_id", "quest_milestones", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_quest_milestones_user_id", table_name="quest_milestones")
    op.drop_index("ix_quest_milestones_quest_id", table_name="quest_milestones")
    op.drop_table("quest_milestones")
