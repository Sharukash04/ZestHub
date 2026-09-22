from app.models import User, Restaurant, Rating
from app.auth import hash_password


def create_test_user(db, name, email, role="user"):
    user = User(
        name=name,
        email=email,
        password=hash_password("password123"),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_restaurant(db, name="Rating Test Restaurant"):
    restaurant = Restaurant(
        name=name,
        location="Test Location",
        cuisine="Test Cuisine",
        description="Restaurant for rating tests",
        average_rating=0.0,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


def login_user(client, email):
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def test_get_restaurant_rating(client, db):
    user1 = create_test_user(
        db,
        "Rating User 1",
        "ratinguser1@test.com",
    )

    user2 = create_test_user(
        db,
        "Rating User 2",
        "ratinguser2@test.com",
    )

    restaurant = create_test_restaurant(db)

    db.add(
        Rating(
            rating=4.0,
            user_id=user1.id,
            restaurant_id=restaurant.id,
        )
    )

    db.add(
        Rating(
            rating=5.0,
            user_id=user2.id,
            restaurant_id=restaurant.id,
        )
    )

    db.commit()

    response = client.get(
        f"/api/ratings/restaurant/{restaurant.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["restaurant_id"] == restaurant.id
    assert data["average_rating"] == 4.5
    assert data["total_ratings"] == 2


def test_get_rating_for_nonexistent_restaurant(client):
    response = client.get(
        "/api/ratings/restaurant/999999"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_get_my_rating_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.get(
        f"/api/ratings/restaurant/{restaurant.id}/my-rating"
    )

    assert response.status_code == 401


def test_get_my_rating_when_user_has_not_rated(client, db):
    user = create_test_user(
        db,
        "No Rating User",
        "norating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.get(
        f"/api/ratings/restaurant/{restaurant.id}/my-rating",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["has_rated"] is False
    assert data["rating"] is None


def test_create_rating(client, db):
    user = create_test_user(
        db,
        "Create Rating User",
        "createrating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 4.0,
        },
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Rating added successfully"
    assert data["rating"] == 4.0
    assert data["average_rating"] == 4.0


def test_create_rating_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 4.0,
        },
    )

    assert response.status_code == 401


def test_create_rating_for_nonexistent_restaurant(client, db):
    user = create_test_user(
        db,
        "Missing Restaurant User",
        "missingrestaurant@test.com",
    )

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": 999999,
            "rating": 4.0,
        },
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_rating_validation_rejects_value_below_one(client, db):
    user = create_test_user(
        db,
        "Low Rating User",
        "lowrating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 0,
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_rating_validation_rejects_value_above_five(client, db):
    user = create_test_user(
        db,
        "High Rating User",
        "highrating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 6,
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_update_existing_rating(client, db):
    user = create_test_user(
        db,
        "Update Rating User",
        "updaterating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    first_response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 3.0,
        },
        headers=headers,
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 5.0,
        },
        headers=headers,
    )

    assert second_response.status_code == 200

    data = second_response.json()

    assert data["message"] == "Rating updated successfully"
    assert data["rating"] == 5.0
    assert data["average_rating"] == 5.0


def test_my_rating_returns_existing_rating(client, db):
    user = create_test_user(
        db,
        "Existing Rating User",
        "existingrating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 4.5,
        },
        headers=headers,
    )

    response = client.get(
        f"/api/ratings/restaurant/{restaurant.id}/my-rating",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["has_rated"] is True
    assert data["rating"] == 4.5


def test_delete_my_rating(client, db):
    user = create_test_user(
        db,
        "Delete Rating User",
        "deleterating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    create_response = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 4.0,
        },
        headers=headers,
    )

    assert create_response.status_code == 200

    response = client.delete(
        f"/api/ratings/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Rating deleted successfully"
    assert data["average_rating"] == 0.0


def test_delete_rating_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.delete(
        f"/api/ratings/restaurant/{restaurant.id}"
    )

    assert response.status_code == 401


def test_delete_nonexistent_rating(client, db):
    user = create_test_user(
        db,
        "Delete Missing Rating User",
        "deletemissingrating@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.delete(
        f"/api/ratings/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Rating not found"


def test_multiple_ratings_update_average(client, db):
    user1 = create_test_user(
        db,
        "Average User 1",
        "average1@test.com",
    )

    user2 = create_test_user(
        db,
        "Average User 2",
        "average2@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers1 = login_user(
        client,
        user1.email,
    )

    headers2 = login_user(
        client,
        user2.email,
    )

    response1 = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 3.0,
        },
        headers=headers1,
    )

    assert response1.status_code == 200
    assert response1.json()["average_rating"] == 3.0

    response2 = client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 5.0,
        },
        headers=headers2,
    )

    assert response2.status_code == 200
    assert response2.json()["average_rating"] == 4.0


def test_delete_rating_recalculates_average(client, db):
    user1 = create_test_user(
        db,
        "Recalculate User 1",
        "recalculate1@test.com",
    )

    user2 = create_test_user(
        db,
        "Recalculate User 2",
        "recalculate2@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers1 = login_user(
        client,
        user1.email,
    )

    headers2 = login_user(
        client,
        user2.email,
    )

    client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 2.0,
        },
        headers=headers1,
    )

    client.post(
        "/api/ratings/",
        json={
            "restaurant_id": restaurant.id,
            "rating": 4.0,
        },
        headers=headers2,
    )

    delete_response = client.delete(
        f"/api/ratings/restaurant/{restaurant.id}",
        headers=headers1,
    )

    assert delete_response.status_code == 200

    data = delete_response.json()

    assert data["average_rating"] == 4.0
