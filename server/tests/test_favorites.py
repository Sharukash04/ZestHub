from app.models import User, Restaurant, Favorite
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


def create_test_restaurant(
    db,
    name="Favorite Test Restaurant",
):
    restaurant = Restaurant(
        name=name,
        location="Test Location",
        cuisine="Test Cuisine",
        description="Restaurant for favorite tests",
        average_rating=4.5,
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

    return {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }


def test_check_favorite_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.get(
        f"/api/favorites/restaurant/{restaurant.id}"
    )

    assert response.status_code == 401


def test_check_favorite_when_not_favorited(client, db):
    user = create_test_user(
        db,
        "Check Favorite User",
        "checkfavorite@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.get(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["restaurant_id"] == restaurant.id
    assert data["is_favorite"] is False


def test_check_favorite_when_favorited(client, db):
    user = create_test_user(
        db,
        "Favorited Check User",
        "favoritedcheck@test.com",
    )

    restaurant = create_test_restaurant(db)

    db.add(
        Favorite(
            user_id=user.id,
            restaurant_id=restaurant.id,
        )
    )

    db.commit()

    headers = login_user(
        client,
        user.email,
    )

    response = client.get(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["restaurant_id"] == restaurant.id
    assert data["is_favorite"] is True


def test_check_favorite_for_nonexistent_restaurant(client, db):
    user = create_test_user(
        db,
        "Missing Favorite Restaurant User",
        "missingfavoritecheck@test.com",
    )

    headers = login_user(
        client,
        user.email,
    )

    response = client.get(
        "/api/favorites/restaurant/999999",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_add_favorite(client, db):
    user = create_test_user(
        db,
        "Add Favorite User",
        "addfavorite@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Restaurant added to favorites"
    assert data["is_favorite"] is True

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user.id,
            Favorite.restaurant_id == restaurant.id,
        )
        .first()
    )

    assert favorite is not None


def test_add_favorite_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.post(
        f"/api/favorites/restaurant/{restaurant.id}"
    )

    assert response.status_code == 401


def test_add_favorite_for_nonexistent_restaurant(client, db):
    user = create_test_user(
        db,
        "Missing Add Favorite User",
        "missingaddfavorite@test.com",
    )

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        "/api/favorites/restaurant/999999",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_add_duplicate_favorite(client, db):
    user = create_test_user(
        db,
        "Duplicate Favorite User",
        "duplicatefavorite@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    first_response = client.post(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert first_response.status_code == 200

    second_response = client.post(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert second_response.status_code == 200

    data = second_response.json()

    assert data["message"] == "Restaurant is already in your favorites"
    assert data["is_favorite"] is True

    favorites = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user.id,
            Favorite.restaurant_id == restaurant.id,
        )
        .all()
    )

    assert len(favorites) == 1


def test_remove_favorite(client, db):
    user = create_test_user(
        db,
        "Remove Favorite User",
        "removefavorite@test.com",
    )

    restaurant = create_test_restaurant(db)

    db.add(
        Favorite(
            user_id=user.id,
            restaurant_id=restaurant.id,
        )
    )

    db.commit()

    headers = login_user(
        client,
        user.email,
    )

    response = client.delete(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Restaurant removed from favorites"
    assert data["is_favorite"] is False

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user.id,
            Favorite.restaurant_id == restaurant.id,
        )
        .first()
    )

    assert favorite is None


def test_remove_favorite_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.delete(
        f"/api/favorites/restaurant/{restaurant.id}"
    )

    assert response.status_code == 401


def test_remove_nonexistent_favorite(client, db):
    user = create_test_user(
        db,
        "Remove Missing Favorite User",
        "removemissingfavorite@test.com",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.delete(
        f"/api/favorites/restaurant/{restaurant.id}",
        headers=headers,
    )

    assert response.status_code == 404
    assert (
        response.json()["detail"]
        == "Restaurant is not in your favorites"
    )


def test_get_my_favorites_requires_authentication(client):
    response = client.get(
        "/api/favorites/my-favorites"
    )

    assert response.status_code == 401


def test_get_my_favorites_empty(client, db):
    user = create_test_user(
        db,
        "Empty Favorites User",
        "emptyfavorites@test.com",
    )

    headers = login_user(
        client,
        user.email,
    )

    response = client.get(
        "/api/favorites/my-favorites",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json() == []


def test_get_my_favorites_returns_restaurants(client, db):
    user = create_test_user(
        db,
        "My Favorites User",
        "myfavorites@test.com",
    )

    restaurant1 = create_test_restaurant(
        db,
        "Favorite Restaurant One",
    )

    restaurant2 = create_test_restaurant(
        db,
        "Favorite Restaurant Two",
    )

    db.add(
        Favorite(
            user_id=user.id,
            restaurant_id=restaurant1.id,
        )
    )

    db.add(
        Favorite(
            user_id=user.id,
            restaurant_id=restaurant2.id,
        )
    )

    db.commit()

    headers = login_user(
        client,
        user.email,
    )

    response = client.get(
        "/api/favorites/my-favorites",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    names = {item["name"] for item in data}

    assert "Favorite Restaurant One" in names
    assert "Favorite Restaurant Two" in names


def test_my_favorites_only_returns_current_users_favorites(
    client,
    db,
):
    user1 = create_test_user(
        db,
        "Favorites Owner One",
        "favoritesowner1@test.com",
    )

    user2 = create_test_user(
        db,
        "Favorites Owner Two",
        "favoritesowner2@test.com",
    )

    restaurant1 = create_test_restaurant(
        db,
        "User One Restaurant",
    )

    restaurant2 = create_test_restaurant(
        db,
        "User Two Restaurant",
    )

    db.add(
        Favorite(
            user_id=user1.id,
            restaurant_id=restaurant1.id,
        )
    )

    db.add(
        Favorite(
            user_id=user2.id,
            restaurant_id=restaurant2.id,
        )
    )

    db.commit()

    headers = login_user(
        client,
        user1.email,
    )

    response = client.get(
        "/api/favorites/my-favorites",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == "User One Restaurant"
