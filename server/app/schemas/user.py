"""
Pydantic schemas for User model validation and serialization.
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# Shared properties
class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr


# Properties to receive via API on creation
class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


# Properties to receive via API on login
class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


# Properties to return via API
class UserResponse(UserBase):
    """Schema for user response (safe for client)."""
    id: UUID
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Properties stored in DB
class UserInDB(UserBase):
    """Schema representing user in database."""
    id: UUID
    hashed_password: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Token schemas
class Token(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload schema."""
    sub: str  # Subject (user ID)
    exp: int  # Expiration timestamp
