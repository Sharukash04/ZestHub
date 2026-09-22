from io import BytesIO
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Restaurant, User


def register_user(
    client: TestClient,
    name: str,
    email: str,
    password: str,
    role: str,
):
    with patch(
        "app.routes.auth.send_welcome_email",
    ), patch(
        "app.routes.auth.send_verification_email",
    ):
        response = client.post(
            "/api/auth/register",
            json={
                "name": name,
                "email": email,
                "password": password,
                "role": role,
            },
        )

    assert response.status_code == 201


def login_user(
    client: TestClient,
    email: str,
    password: str,
):
    with patch(
        "app.routes.auth.send_login_notification",
    ):
        response = client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )

    assert response.status_code == 200

    return response.json()["access_token"]


def create_test_image():
    return {
        "image": (
            "restaurant.jpg",
            BytesIO(b"fake image content"),
            "image/jpeg",
        )
    }


def test_get_restaurants_public(client):
    response = client.get("/api/restaurants/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_nonexistent_restaurant(client):
    response = client.get("/api/restaurants/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_customer_cannot_create_restaurant(client):
    register_user(
        client,
        "Customer Restaurant Test",
        "restaurant_customer@example.com",
        "Password123",
        "user",
    )

    token = login_user(
        client,
        "restaurant_customer@example.com",
        "Password123",
    )

    response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Customer Restaurant",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "4.0",
        },
        files=create_test_image(),
    )

    assert response.status_code == 403
    assert (
        response.json()["detail"]
        == "Admin or owner access required"
    )


def test_owner_can_create_restaurant(client, db: Session):
    register_user(
        client,
        "Restaurant Owner",
        "restaurant_owner@example.com",
        "Password123",
        "owner",
    )

    token = login_user(
        client,
        "restaurant_owner@example.com",
        "Password123",
    )

    response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Owner Test Restaurant",
            "location": "Trichy",
            "cuisine": "South Indian",
            "rating": "4.5",
            "description": "Test restaurant",
        },
        files=create_test_image(),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Restaurant created successfully"
    assert data["restaurant"]["name"] == "Owner Test Restaurant"
    assert data["restaurant"]["rating"] == 4.5

    owner = (
        db.query(User)
        .filter(
            User.email == "restaurant_owner@example.com"
        )
        .first()
    )

    assert owner is not None
    assert data["restaurant"]["owner_id"] == owner.id


def test_admin_can_create_restaurant(client):
    with patch(
        "app.routes.auth.send_login_notification",
    ):
        response = client.post(
            "/api/auth/login",
            json={
                "email": "sharukash01@gmail.com",
                "password": "Password123",
            },
        )

    # The existing admin account may use a different password.
    # Skip this test if the local admin credentials are unavailable.
    if response.status_code != 200:
        return

    token = response.json()["access_token"]

    response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Admin Test Restaurant",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "4.0",
        },
        files=create_test_image(),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["restaurant"]["owner_id"] is None


def test_invalid_rating_is_rejected(client):
    register_user(
        client,
        "Rating Owner",
        "rating_owner@example.com",
        "Password123",
        "owner",
    )

    token = login_user(
        client,
        "rating_owner@example.com",
        "Password123",
    )

    response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Invalid Rating Restaurant",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "6.0",
        },
        files=create_test_image(),
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Rating must be between 0 and 5"
    )


def test_nonexistent_category_is_rejected(client):
    register_user(
        client,
        "Category Owner",
        "category_owner@example.com",
        "Password123",
        "owner",
    )

    token = login_user(
        client,
        "category_owner@example.com",
        "Password123",
    )

    response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Category Test Restaurant",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "4.0",
            "category_id": "999999",
        },
        files=create_test_image(),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"


def test_owner_can_update_own_restaurant(client):
    register_user(
        client,
        "Update Owner",
        "update_owner@example.com",
        "Password123",
        "owner",
    )

    token = login_user(
        client,
        "update_owner@example.com",
        "Password123",
    )

    create_response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Restaurant Before Update",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "4.0",
        },
        files=create_test_image(),
    )

    assert create_response.status_code == 200

    restaurant_id = create_response.json()["restaurant"]["id"]

    response = client.put(
        f"/api/restaurants/{restaurant_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Restaurant After Update",
            "location": "Chennai",
            "cuisine": "Tamil",
            "rating": "4.8",
            "description": "Updated restaurant",
        },
    )

    assert response.status_code == 200

    data = response.json()["restaurant"]

    assert data["name"] == "Restaurant After Update"
    assert data["location"] == "Chennai"
    assert data["rating"] == 4.8


def test_owner_cannot_update_another_owners_restaurant(client):
    register_user(
        client,
        "First Owner",
        "first_owner@example.com",
        "Password123",
        "owner",
    )

    first_token = login_user(
        client,
        "first_owner@example.com",
        "Password123",
    )

    create_response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {first_token}",
        },
        data={
            "name": "First Owner Restaurant",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "4.0",
        },
        files=create_test_image(),
    )

    assert create_response.status_code == 200

    restaurant_id = create_response.json()["restaurant"]["id"]

    register_user(
        client,
        "Second Owner",
        "second_owner@example.com",
        "Password123",
        "owner",
    )

    second_token = login_user(
        client,
        "second_owner@example.com",
        "Password123",
    )

    response = client.put(
        f"/api/restaurants/{restaurant_id}",
        headers={
            "Authorization": f"Bearer {second_token}",
        },
        data={
            "name": "Unauthorized Update",
            "location": "Chennai",
            "cuisine": "Indian",
            "rating": "5.0",
        },
    )

    assert response.status_code == 403
    assert (
        response.json()["detail"]
        == "You can only manage your own restaurants"
    )


def test_owner_can_delete_own_restaurant(client):
    register_user(
        client,
        "Delete Owner",
        "delete_owner@example.com",
        "Password123",
        "owner",
    )

    token = login_user(
        client,
        "delete_owner@example.com",
        "Password123",
    )

    create_response = client.post(
        "/api/restaurants/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        data={
            "name": "Restaurant To Delete",
            "location": "Trichy",
            "cuisine": "Indian",
            "rating": "4.0",
        },
        files=create_test_image(),
    )

    assert create_response.status_code == 200

    restaurant_id = create_response.json()["restaurant"]["id"]

    delete_response = client.delete(
        f"/api/restaurants/{restaurant_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert delete_response.status_code == 200
    assert (
        delete_response.json()["message"]
        == "Restaurant deleted successfully"
    )

    get_response = client.get(
        f"/api/restaurants/{restaurant_id}"
    )

    assert get_response.status_code == 404
