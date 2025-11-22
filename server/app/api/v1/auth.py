"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency to get AuthService instance."""
    return AuthService(db)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service)
) -> UserResponse:
    """
    Dependency to get current authenticated user.

    Use this in protected endpoints with: current_user = Depends(get_current_user)
    """
    user = auth_service.get_current_user(token)
    return UserResponse.model_validate(user)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user.

    - **email**: Valid email address (must be unique)
    - **password**: Minimum 8 characters
    """
    user = auth_service.register_user(user_create)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
def login(
    user_login: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login with email and password.

    Returns JWT access token on successful authentication.

    - **email**: Registered email address
    - **password**: User password
    """
    user = auth_service.authenticate_user(user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_service.create_access_token_for_user(user)
    return token


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user.

    Protected endpoint - requires valid JWT token.
    """
    return current_user


@router.post("/logout")
def logout():
    """
    Logout endpoint.

    Since we're using JWT tokens stored client-side, logout is handled on the frontend
    by removing the token from localStorage. This endpoint exists for consistency
    and could be extended later for token blacklisting if needed.
    """
    return {"message": "Successfully logged out"}
