from app.models import User, Restaurant, Review
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


def create_test_restaurant(db, name="Review Test Restaurant"):
    restaurant = Restaurant(
        name=name,
        location="Test Location",
        cuisine="Test Cuisine",
        description="Restaurant for review tests",
        average_rating=4.0,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return restaurant


def login_user(client, email, password="password123"):
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_get_restaurant_reviews(client, db):
    user = create_test_user(
        db,
        "Review Reader",
        "reviewreader@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Review Reader Restaurant",
    )

    response = client.get(
        f"/api/reviews/restaurant/{restaurant.id}"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_get_reviews_for_nonexistent_restaurant(client):
    response = client.get(
        "/api/reviews/restaurant/999999"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_get_my_reviews_requires_authentication(client):
    response = client.get(
        "/api/reviews/my-reviews"
    )

    assert response.status_code in [401, 403]


def test_create_review(client, db):
    user = create_test_user(
        db,
        "Review Creator",
        "reviewcreator@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Review Creator Restaurant",
    )

    token = login_user(
        client,
        "reviewcreator@test.com",
    )

    response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "Excellent food and service!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Review added successfully"
    assert data["review"]["comment"] == "Excellent food and service!"
    assert data["review"]["user_name"] == "Review Creator"
    assert data["review"]["restaurant_id"] == restaurant.id


def test_create_review_requires_authentication(client, db):
    restaurant = create_test_restaurant(
        db,
        "Authentication Restaurant",
    )

    response = client.post(
        "/api/reviews/",
        json={
            "restaurant_id": restaurant.id,
            "comment": "Nice restaurant",
        },
    )

    assert response.status_code in [401, 403]


def test_create_review_for_nonexistent_restaurant(client, db):
    create_test_user(
        db,
        "Missing Restaurant User",
        "missingrestaurant2@test.com",
    )

    token = login_user(
        client,
        "missingrestaurant2@test.com",
    )

    response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": 999999,
            "comment": "Nice restaurant",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_duplicate_review_is_rejected(client, db):
    create_test_user(
        db,
        "Duplicate Reviewer",
        "duplicatereviewer@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Duplicate Review Restaurant",
    )

    token = login_user(
        client,
        "duplicatereviewer@test.com",
    )

    first_response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "First review",
        },
    )

    second_response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "Second review",
        },
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 400

    assert (
        second_response.json()["detail"]
        == "You have already reviewed this restaurant"
    )


def test_review_comment_validation(client, db):
    create_test_user(
        db,
        "Validation Reviewer",
        "validationreviewer@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Validation Review Restaurant",
    )

    token = login_user(
        client,
        "validationreviewer@test.com",
    )

    response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "Hi",
        },
    )

    assert response.status_code == 422


def test_review_comment_is_trimmed(client, db):
    create_test_user(
        db,
        "Trim Reviewer",
        "trimreviewer@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Trim Review Restaurant",
    )

    token = login_user(
        client,
        "trimreviewer@test.com",
    )

    response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "   Great restaurant   ",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()["review"]["comment"]
        == "Great restaurant"
    )


def test_get_my_reviews(client, db):
    create_test_user(
        db,
        "My Reviews User",
        "myreviews@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "My Reviews Restaurant",
    )

    token = login_user(
        client,
        "myreviews@test.com",
    )

    create_response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "My personal review",
        },
    )

    assert create_response.status_code == 200

    response = client.get(
        "/api/reviews/my-reviews",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["comment"] == "My personal review"
    assert data[0]["user_name"] == "My Reviews User"
    assert data[0]["restaurant_id"] == restaurant.id
    assert data[0]["restaurant_name"] == "My Reviews Restaurant"


def test_delete_own_review(client, db):
    create_test_user(
        db,
        "Review Deleter",
        "reviewdeleter@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Delete Review Restaurant",
    )

    token = login_user(
        client,
        "reviewdeleter@test.com",
    )

    create_response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "Review to delete",
        },
    )

    review_id = create_response.json()["review"]["id"]

    delete_response = client.delete(
        f"/api/reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert delete_response.status_code == 200
    assert (
        delete_response.json()["message"]
        == "Review deleted successfully"
    )


def test_user_cannot_delete_another_users_review(client, db):
    create_test_user(
        db,
        "Review Owner",
        "reviewowner@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Protected Review Restaurant",
    )

    owner_token = login_user(
        client,
        "reviewowner@test.com",
    )

    create_response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {owner_token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "Protected review",
        },
    )

    assert create_response.status_code == 200

    review_id = create_response.json()["review"]["id"]

    create_test_user(
        db,
        "Other Reviewer",
        "otherreviewer@test.com",
    )

    other_token = login_user(
        client,
        "otherreviewer@test.com",
    )

    response = client.delete(
        f"/api/reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        },
    )

    assert response.status_code == 403

    assert (
        response.json()["detail"]
        == "You can only delete your own review"
    )


def test_delete_nonexistent_review(client, db):
    create_test_user(
        db,
        "Missing Review User",
        "missingreview@test.com",
    )

    token = login_user(
        client,
        "missingreview@test.com",
    )

    response = client.delete(
        "/api/reviews/999999",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Review not found"


def test_restaurant_reviews_include_user_details(client, db):
    create_test_user(
        db,
        "Review Detail User",
        "reviewdetail@test.com",
    )

    restaurant = create_test_restaurant(
        db,
        "Review Details Restaurant",
    )

    token = login_user(
        client,
        "reviewdetail@test.com",
    )

    create_response = client.post(
        "/api/reviews/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "restaurant_id": restaurant.id,
            "comment": "Detailed review",
        },
    )

    assert create_response.status_code == 200

    response = client.get(
        f"/api/reviews/restaurant/{restaurant.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["comment"] == "Detailed review"
    assert data[0]["user_name"] == "Review Detail User"
    assert data[0]["user_id"] is not None
    assert data[0]["restaurant_id"] == restaurant.id
    assert data[0]["created_at"] is not None
