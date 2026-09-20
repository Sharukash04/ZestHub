import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.email_service import (
    send_login_notification,
    send_verification_email,
    send_welcome_email,
)
from app.models import User


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# =========================================================
# REQUEST SCHEMAS
# =========================================================

class RegisterRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=72
    )

    # Public registration supports only:
    # user   = Customer
    # owner  = Restaurant Owner
    #
    # admin is intentionally NOT allowed here.
    role: str = Field(
        default="user"
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=72
    )


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    name = data.name.strip()
    email = data.email.lower().strip()
    requested_role = data.role.strip().lower()

    # -----------------------------------------------------
    # Validate name
    # -----------------------------------------------------

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty."
        )

    # -----------------------------------------------------
    # Validate public registration role
    # -----------------------------------------------------

    allowed_roles = {
        "user",
        "owner",
    }

    if requested_role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid account type. Please choose Customer or Restaurant Owner."
        )

    # -----------------------------------------------------
    # Check existing user
    # -----------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # -----------------------------------------------------
    # Generate email verification token
    # -----------------------------------------------------

    verification_token = secrets.token_urlsafe(32)

    verification_expiry = (
        datetime.now(timezone.utc)
        + timedelta(hours=24)
    )

    # -----------------------------------------------------
    # Create user
    # -----------------------------------------------------

    user = User(
        name=name,
        email=email,
        password=hash_password(data.password),

        # Only user or owner can reach this point.
        # Admin cannot be created through registration.
        role=requested_role,

        is_verified=False,
        verification_token=verification_token,
        verification_token_expires=verification_expiry,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # -----------------------------------------------------
    # SEND WELCOME EMAIL
    # -----------------------------------------------------

    await send_welcome_email(
        name=user.name,
        email=user.email
    )

    # -----------------------------------------------------
    # SEND VERIFICATION EMAIL
    # -----------------------------------------------------

    await send_verification_email(
        name=user.name,
        email=user.email,
        verification_token=user.verification_token
    )

    # -----------------------------------------------------
    # Return registration result
    # -----------------------------------------------------

    return {
        "message": "User registered successfully",

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
        },

        "verification_required": True,

        "email_sent": True,
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
async def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # Do not reveal whether email exists
    # through separate error messages.
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # -----------------------------------------------------
    # Create JWT
    # -----------------------------------------------------

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    # -----------------------------------------------------
    # SEND LOGIN NOTIFICATION
    # -----------------------------------------------------

    await send_login_notification(
        name=user.name,
        email=user.email
    )

    return {
        "message": "Login successful",

        "access_token": access_token,

        "token_type": "bearer",

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
        },

        "email_notification_sent": True,
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
    }


# =========================================================
# VERIFY EMAIL
# =========================================================

@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.verification_token == token
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token."
        )

    if user.is_verified:
        return {
            "message": "Email already verified."
        }

    if not user.verification_token_expires:
        raise HTTPException(
            status_code=400,
            detail="Verification token is invalid."
        )

    expiry = user.verification_token_expires

    # PostgreSQL may return a timezone-naive datetime
    if expiry.tzinfo is None:
        expiry = expiry.replace(
            tzinfo=timezone.utc
        )

    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(
            status_code=400,
            detail="Verification token has expired."
        )

    # -----------------------------------------------------
    # Verify account
    # -----------------------------------------------------

    user.is_verified = True

    # Remove token after successful verification
    user.verification_token = None
    user.verification_token_expires = None

    db.commit()
    db.refresh(user)

    return {
        "message": "Email verified successfully.",

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
        }
    }