from unittest.mock import AsyncMock, patch

from app.auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models import User


def test_password_hashing():
    password = "TestPassword123"

    hashed_password = hash_password(password)

    assert hashed_password != password
    assert verify_password(password, hashed_password)
    assert not verify_password("WrongPassword123", hashed_password)


def test_register_customer(client, db):
    with patch(
        "app.routes.auth.send_welcome_email",
        new_callable=AsyncMock,
    ), patch(
        "app.routes.auth.send_verification_email",
        new_callable=AsyncMock,
    ):
        response = client.post(
            "/api/auth/register",
            json={
                "name": "Test Customer",
                "email": "customer_test@example.com",
                "password": "TestPassword123",
                "role": "user",
            },
        )

    assert response.status_code == 201

    data = response.json()

    assert data["message"] == "User registered successfully"
    assert data["user"]["role"] == "user"
    assert data["user"]["is_verified"] is False
    assert data["verification_required"] is True


def test_register_owner(client):
    with patch(
        "app.routes.auth.send_welcome_email",
        new_callable=AsyncMock,
    ), patch(
        "app.routes.auth.send_verification_email",
        new_callable=AsyncMock,
    ):
        response = client.post(
            "/api/auth/register",
            json={
                "name": "Test Owner",
                "email": "owner_test@example.com",
                "password": "OwnerPassword123",
                "role": "owner",
            },
        )

    assert response.status_code == 201
    assert response.json()["user"]["role"] == "owner"


def test_admin_registration_is_not_allowed(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Fake Admin",
            "email": "fake_admin@example.com",
            "password": "AdminPassword123",
            "role": "admin",
        },
    )

    assert response.status_code == 400


def test_duplicate_email_is_rejected(client):
    with patch(
        "app.routes.auth.send_welcome_email",
        new_callable=AsyncMock,
    ), patch(
        "app.routes.auth.send_verification_email",
        new_callable=AsyncMock,
    ):
        first_response = client.post(
            "/api/auth/register",
            json={
                "name": "Duplicate User",
                "email": "duplicate_test@example.com",
                "password": "Password123",
                "role": "user",
            },
        )

        second_response = client.post(
            "/api/auth/register",
            json={
                "name": "Another User",
                "email": "duplicate_test@example.com",
                "password": "Password123",
                "role": "user",
            },
        )

    assert first_response.status_code == 201
    assert second_response.status_code == 400


def test_login_success(client):
    with patch(
        "app.routes.auth.send_welcome_email",
        new_callable=AsyncMock,
    ), patch(
        "app.routes.auth.send_verification_email",
        new_callable=AsyncMock,
    ), patch(
        "app.routes.auth.send_login_notification",
        new_callable=AsyncMock,
    ):
        register_response = client.post(
            "/api/auth/register",
            json={
                "name": "Login Test User",
                "email": "login_test@example.com",
                "password": "LoginPassword123",
                "role": "user",
            },
        )

        assert register_response.status_code == 201

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "login_test@example.com",
                "password": "LoginPassword123",
            },
        )

    assert login_response.status_code == 200

    data = login_response.json()

    assert data["message"] == "Login successful"
    assert data["token_type"] == "bearer"
    assert data["access_token"]


def test_login_wrong_password(client):
    with patch(
        "app.routes.auth.send_welcome_email",
        new_callable=AsyncMock,
    ), patch(
        "app.routes.auth.send_verification_email",
        new_callable=AsyncMock,
    ):
        client.post(
            "/api/auth/register",
            json={
                "name": "Wrong Password User",
                "email": "wrong_password@example.com",
                "password": "CorrectPassword123",
                "role": "user",
            },
        )

    with patch(
        "app.routes.auth.send_login_notification",
        new_callable=AsyncMock,
    ):
        response = client.post(
            "/api/auth/login",
            json={
                "email": "wrong_password@example.com",
                "password": "WrongPassword123",
            },
        )

    assert response.status_code == 401


def test_current_user_requires_authentication(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_invalid_token_is_rejected(client):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401


def test_jwt_creation_and_decoding():
    token = create_access_token(
        {
            "sub": "123",
            "email": "jwt@example.com",
            "role": "user",
        }
    )

    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "123"
    assert payload["email"] == "jwt@example.com"
    assert payload["role"] == "user"
    assert "exp" in payload
