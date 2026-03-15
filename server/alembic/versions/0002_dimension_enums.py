"""dimension enums

Revision ID: 0002_dimension_enums
Revises: 0001_phase1_schema
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_dimension_enums"
down_revision = "0001_phase1_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    life_dimension = postgresql.ENUM(
        "vitality",
        "psyche",
        "prowess",
        "wealth",
        "alliance",
        "legacy",
        name="lifedimension",
    )
    life_dimension.create(bind, checkfirst=True)

    op.execute(
        """
        UPDATE tasks
        SET category = CASE lower(trim(category))
            WHEN 'vitality' THEN 'vitality'
            WHEN 'body' THEN 'vitality'
            WHEN 'body & vitality' THEN 'vitality'
            WHEN 'psyche' THEN 'psyche'
            WHEN 'mind' THEN 'psyche'
            WHEN 'mind & inner world' THEN 'psyche'
            WHEN 'prowess' THEN 'prowess'
            WHEN 'work' THEN 'prowess'
            WHEN 'work & mastery' THEN 'prowess'
            WHEN 'wealth' THEN 'wealth'
            WHEN 'wealth & resources' THEN 'wealth'
            WHEN 'alliance' THEN 'alliance'
            WHEN 'connection' THEN 'alliance'
            WHEN 'connection & belonging' THEN 'alliance'
            WHEN 'legacy' THEN 'legacy'
            WHEN 'meaning' THEN 'legacy'
            WHEN 'meaning & transcendence' THEN 'legacy'
            ELSE 'vitality'
        END
        """
    )

    op.execute(
        """
        UPDATE quests
        SET category = CASE lower(trim(category))
            WHEN 'vitality' THEN 'vitality'
            WHEN 'body' THEN 'vitality'
            WHEN 'body & vitality' THEN 'vitality'
            WHEN 'psyche' THEN 'psyche'
            WHEN 'mind' THEN 'psyche'
            WHEN 'mind & inner world' THEN 'psyche'
            WHEN 'prowess' THEN 'prowess'
            WHEN 'work' THEN 'prowess'
            WHEN 'work & mastery' THEN 'prowess'
            WHEN 'wealth' THEN 'wealth'
            WHEN 'wealth & resources' THEN 'wealth'
            WHEN 'alliance' THEN 'alliance'
            WHEN 'connection' THEN 'alliance'
            WHEN 'connection & belonging' THEN 'alliance'
            WHEN 'legacy' THEN 'legacy'
            WHEN 'meaning' THEN 'legacy'
            WHEN 'meaning & transcendence' THEN 'legacy'
            ELSE NULL
        END
        WHERE category IS NOT NULL
        """
    )

    op.alter_column(
        "tasks",
        "category",
        existing_type=sa.String(length=64),
        type_=life_dimension,
        existing_nullable=False,
        postgresql_using="category::lifedimension",
    )
    op.alter_column(
        "quests",
        "category",
        existing_type=sa.String(length=64),
        type_=life_dimension,
        existing_nullable=True,
        postgresql_using="category::lifedimension",
    )


def downgrade() -> None:
    op.alter_column(
        "tasks",
        "category",
        existing_type=postgresql.ENUM(name="lifedimension"),
        type_=sa.String(length=64),
        existing_nullable=False,
        postgresql_using="category::text",
    )
    op.alter_column(
        "quests",
        "category",
        existing_type=postgresql.ENUM(name="lifedimension"),
        type_=sa.String(length=64),
        existing_nullable=True,
        postgresql_using="category::text",
    )
    postgresql.ENUM(name="lifedimension").drop(op.get_bind(), checkfirst=True)
