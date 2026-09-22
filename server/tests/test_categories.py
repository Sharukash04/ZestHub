def test_get_categories(client):
    response = client.get("/api/categories/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_category(client):
    response = client.post(
        "/api/categories/",
        json={
            "name": "Test Cuisine",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["message"] == "Category created successfully"
    assert data["category"]["name"] == "Test Cuisine"
    assert data["category"]["id"] is not None


def test_get_category_by_id(client):
    create_response = client.post(
        "/api/categories/",
        json={
            "name": "Get Category Test",
        },
    )

    assert create_response.status_code == 201

    category_id = create_response.json()["category"]["id"]

    response = client.get(
        f"/api/categories/{category_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == category_id
    assert data["name"] == "Get Category Test"


def test_nonexistent_category(client):
    response = client.get(
        "/api/categories/999999"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"


def test_duplicate_category_is_rejected(client):
    first_response = client.post(
        "/api/categories/",
        json={
            "name": "Duplicate Cuisine",
        },
    )

    second_response = client.post(
        "/api/categories/",
        json={
            "name": "Duplicate Cuisine",
        },
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409

    assert (
        second_response.json()["detail"]
        == "Category already exists"
    )


def test_category_name_validation(client):
    response = client.post(
        "/api/categories/",
        json={
            "name": "A",
        },
    )

    assert response.status_code == 422


def test_update_category(client):
    create_response = client.post(
        "/api/categories/",
        json={
            "name": "Category Before Update",
        },
    )

    assert create_response.status_code == 201

    category_id = create_response.json()["category"]["id"]

    response = client.put(
        f"/api/categories/{category_id}",
        json={
            "name": "Category After Update",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Category updated successfully"
    assert data["category"]["id"] == category_id
    assert data["category"]["name"] == "Category After Update"


def test_update_nonexistent_category(client):
    response = client.put(
        "/api/categories/999999",
        json={
            "name": "Updated Category",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"


def test_duplicate_category_update_is_rejected(client):
    first_response = client.post(
        "/api/categories/",
        json={
            "name": "First Update Category",
        },
    )

    second_response = client.post(
        "/api/categories/",
        json={
            "name": "Second Update Category",
        },
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_id = first_response.json()["category"]["id"]
    second_id = second_response.json()["category"]["id"]

    response = client.put(
        f"/api/categories/{second_id}",
        json={
            "name": "First Update Category",
        },
    )

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Category already exists"
    )


def test_delete_category(client):
    create_response = client.post(
        "/api/categories/",
        json={
            "name": "Category To Delete",
        },
    )

    assert create_response.status_code == 201

    category_id = create_response.json()["category"]["id"]

    delete_response = client.delete(
        f"/api/categories/{category_id}"
    )

    assert delete_response.status_code == 200

    data = delete_response.json()

    assert data["message"] == "Category deleted successfully"
    assert data["category"]["id"] == category_id

    get_response = client.get(
        f"/api/categories/{category_id}"
    )

    assert get_response.status_code == 404


def test_delete_nonexistent_category(client):
    response = client.delete(
        "/api/categories/999999"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"
