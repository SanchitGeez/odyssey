"""
Authentication service (Business Logic Layer).
"""
from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, verify_password, decode_access_token
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, Token


class AuthService:
    """Service for authentication business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository()

    def register_user(self, user_create: UserCreate) -> User:
        """
        Register a new user.

        Args:
            user_create: User registration data

        Returns:
            Created User object

        Raises:
            HTTPException: If email already exists
        """
        # Check if user already exists
        existing_user = self.user_repo.get_by_email(self.db, user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        user = self.user_repo.create(self.db, user_create)
        return user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password.

        Args:
            email: User email
            password: Plain text password

        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.user_repo.get_by_email(self.db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    def create_access_token_for_user(self, user: User) -> Token:
        """
        Create JWT access token for a user.

        Args:
            user: User object

        Returns:
            Token schema with access_token and token_type
        """
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    def get_current_user(self, token: str) -> User:
        """
        Get current user from JWT token.

        Args:
            token: JWT access token

        Returns:
            User object

        Raises:
            HTTPException: If token invalid or user not found
        """
        payload = decode_access_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = self.user_repo.get_by_id(self.db, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )

        return user
