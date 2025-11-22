"""
User repository for database operations (Data Access Layer).
"""
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


class UserRepository:
    """Repository for User model database operations."""

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get user by email address.

        Args:
            db: Database session
            email: User email address

        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> Optional[User]:
        """
        Get user by ID.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(db: Session, user_create: UserCreate) -> User:
        """
        Create a new user.

        Args:
            db: Database session
            user_create: User creation schema with email and password

        Returns:
            Created User object
        """
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, user: User) -> User:
        """
        Update user in database.

        Args:
            db: Database session
            user: User object with updated fields

        Returns:
            Updated User object
        """
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user: User) -> None:
        """
        Delete user from database.

        Args:
            db: Database session
            user: User object to delete
        """
        db.delete(user)
        db.commit()
