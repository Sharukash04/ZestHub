from io import BytesIO
from pathlib import Path

from app.models import User, Restaurant, MenuItem
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
    owner_id=None,
    name="Menu Test Restaurant",
):
    restaurant = Restaurant(
        name=name,
        location="Test Location",
        cuisine="Test Cuisine",
        description="Restaurant for menu tests",
        average_rating=4.5,
        owner_id=owner_id,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return restaurant


def create_test_menu_item(
    db,
    restaurant_id,
    name="Test Burger",
    price=199.00,
    image=None,
    is_available=True,
):
    menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=name,
        description="Test menu item",
        price=price,
        image=image,
        is_available=is_available,
    )

    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)

    return menu_item


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


def menu_form(
    restaurant_id,
    name="Test Burger",
    description="Test menu item",
    price="199.00",
    image_url="",
    is_available="true",
):
    return {
        "restaurant_id": str(restaurant_id),
        "name": name,
        "description": description,
        "price": price,
        "image_url": image_url,
        "is_available": is_available,
    }


def update_menu_form(
    name="Updated Burger",
    description="Updated description",
    price="249.00",
    image_url="",
    is_available="true",
):
    return {
        "name": name,
        "description": description,
        "price": price,
        "image_url": image_url,
        "is_available": is_available,
    }


# ============================================================
# GET MENU
# ============================================================

def test_get_restaurant_menu_empty(client, db):
    restaurant = create_test_restaurant(db)

    response = client.get(
        f"/api/menu-items/restaurant/{restaurant.id}"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_get_restaurant_menu_returns_items(client, db):
    restaurant = create_test_restaurant(db)

    create_test_menu_item(
        db,
        restaurant.id,
        "Burger",
        199.00,
    )

    create_test_menu_item(
        db,
        restaurant.id,
        "Pizza",
        299.00,
    )

    response = client.get(
        f"/api/menu-items/restaurant/{restaurant.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["name"] == "Pizza"
    assert data[0]["price"] == 299.0
    assert data[1]["name"] == "Burger"
    assert data[1]["price"] == 199.0


def test_get_restaurant_menu_for_nonexistent_restaurant(client):
    response = client.get(
        "/api/menu-items/restaurant/999999"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_get_single_menu_item(client, db):
    restaurant = create_test_restaurant(db)

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
        "Chicken Biryani",
        220.00,
    )

    response = client.get(
        f"/api/menu-items/{menu_item.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == menu_item.id
    assert data["restaurant_id"] == restaurant.id
    assert data["name"] == "Chicken Biryani"
    assert data["price"] == 220.0
    assert data["description"] == "Test menu item"
    assert data["is_available"] is True


def test_get_single_menu_item_not_found(client):
    response = client.get(
        "/api/menu-items/999999"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Menu item not found"


# ============================================================
# CREATE
# ============================================================

def test_create_menu_item_as_owner(client, db):
    owner = create_test_user(
        db,
        "Menu Owner",
        "menuowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="Chicken Biryani",
            description="Special biryani",
            price="220.50",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Menu item created successfully"

    item = data["menu_item"]

    assert item["restaurant_id"] == restaurant.id
    assert item["name"] == "Chicken Biryani"
    assert item["description"] == "Special biryani"
    assert item["price"] == 220.5
    assert item["is_available"] is True


def test_create_menu_item_as_admin(client, db):
    admin = create_test_user(
        db,
        "Menu Admin",
        "menuadmin@test.com",
        role="admin",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        admin.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="Admin Pizza",
            price="350.00",
        ),
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["menu_item"]["name"] == "Admin Pizza"


def test_customer_cannot_create_menu_item(client, db):
    user = create_test_user(
        db,
        "Menu Customer",
        "menucustomer@test.com",
        role="user",
    )

    restaurant = create_test_restaurant(db)

    headers = login_user(
        client,
        user.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
        ),
        headers=headers,
    )

    assert response.status_code == 403


def test_create_menu_item_requires_authentication(client, db):
    restaurant = create_test_restaurant(db)

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
        ),
    )

    assert response.status_code == 401


def test_create_menu_item_for_nonexistent_restaurant(client, db):
    owner = create_test_user(
        db,
        "Missing Menu Restaurant Owner",
        "missingmenurestaurant@test.com",
        role="owner",
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(999999),
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_owner_cannot_manage_another_owners_restaurant(client, db):
    owner1 = create_test_user(
        db,
        "Menu Owner One",
        "menuownerone@test.com",
        role="owner",
    )

    owner2 = create_test_user(
        db,
        "Menu Owner Two",
        "menuownertwo@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner1.id,
    )

    headers = login_user(
        client,
        owner2.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
        ),
        headers=headers,
    )

    assert response.status_code == 403

    assert (
        response.json()["detail"]
        == "You can only manage menu items for your own restaurant"
    )


# ============================================================
# CREATE VALIDATION
# ============================================================

def test_create_menu_item_rejects_short_name(client, db):
    owner = create_test_user(
        db,
        "Short Name Owner",
        "shortnameowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="A",
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Menu item name must contain at least 2 characters"
    )


def test_create_menu_item_rejects_long_name(client, db):
    owner = create_test_user(
        db,
        "Long Name Owner",
        "longnameowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="A" * 151,
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Menu item name must not exceed 150 characters"
    )


def test_create_menu_item_rejects_invalid_price(client, db):
    owner = create_test_user(
        db,
        "Invalid Price Owner",
        "invalidpriceowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            price="not-a-number",
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Price must be a valid number"


def test_create_menu_item_rejects_negative_price(client, db):
    owner = create_test_user(
        db,
        "Negative Price Owner",
        "negativepriceowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            price="-10",
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Price cannot be negative"


def test_create_menu_item_rejects_excessive_price(client, db):
    owner = create_test_user(
        db,
        "Large Price Owner",
        "largepriceowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            price="100000000",
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Price is too large"


def test_create_menu_item_trims_name_and_description(client, db):
    owner = create_test_user(
        db,
        "Trim Menu Owner",
        "trimmenuowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="  Special Pizza  ",
            description="  Fresh pizza  ",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    item = response.json()["menu_item"]

    assert item["name"] == "Special Pizza"
    assert item["description"] == "Fresh pizza"


def test_create_menu_item_with_image_url(client, db):
    owner = create_test_user(
        db,
        "Image URL Owner",
        "imageurlowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            image_url="https://example.com/pizza.jpg",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    item = response.json()["menu_item"]

    assert item["image"] == "https://example.com/pizza.jpg"


def test_create_menu_item_with_unavailable_status(client, db):
    owner = create_test_user(
        db,
        "Unavailable Owner",
        "unavailableowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            is_available="false",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    item = response.json()["menu_item"]

    assert item["is_available"] is False


# ============================================================
# IMAGE UPLOAD
# ============================================================

def test_create_menu_item_with_valid_image(client, db):
    owner = create_test_user(
        db,
        "Upload Owner",
        "uploadowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    image_content = b"fake image content"

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="Uploaded Pizza",
        ),
        files={
            "image": (
                "pizza.jpg",
                BytesIO(image_content),
                "image/jpeg",
            )
        },
        headers=headers,
    )

    assert response.status_code == 200

    item = response.json()["menu_item"]

    assert item["image"] is not None
    assert item["image"].startswith("/uploads/menu/")

    file_path = Path(item["image"].lstrip("/"))

    assert file_path.exists()

    if file_path.exists():
        file_path.unlink()


def test_create_menu_item_rejects_invalid_image_extension(
    client,
    db,
):
    owner = create_test_user(
        db,
        "Invalid Image Owner",
        "invalidimageowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
        ),
        files={
            "image": (
                "menu.txt",
                BytesIO(b"not an image"),
                "text/plain",
            )
        },
        headers=headers,
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "Only JPG, JPEG, PNG and WEBP images are allowed"
    )


def test_create_menu_item_rejects_large_image(client, db):
    owner = create_test_user(
        db,
        "Large Image Owner",
        "largeimageowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    large_content = b"x" * (5 * 1024 * 1024 + 1)

    response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
        ),
        files={
            "image": (
                "large.jpg",
                BytesIO(large_content),
                "image/jpeg",
            )
        },
        headers=headers,
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Image size must not exceed 5 MB"
    )


# ============================================================
# UPDATE
# ============================================================

def test_update_menu_item_as_owner(client, db):
    owner = create_test_user(
        db,
        "Update Owner",
        "updatemenuowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
        "Old Burger",
        150.00,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.put(
        f"/api/menu-items/{menu_item.id}",
        data=update_menu_form(
            name="Updated Burger",
            description="Updated burger",
            price="250.00",
            is_available="false",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Menu item updated successfully"

    item = data["menu_item"]

    assert item["name"] == "Updated Burger"
    assert item["description"] == "Updated burger"
    assert item["price"] == 250.0
    assert item["is_available"] is False


def test_update_menu_item_as_admin(client, db):
    admin = create_test_user(
        db,
        "Update Admin",
        "updatemenuadmin@test.com",
        role="admin",
    )

    restaurant = create_test_restaurant(db)

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
    )

    headers = login_user(
        client,
        admin.email,
    )

    response = client.put(
        f"/api/menu-items/{menu_item.id}",
        data=update_menu_form(
            name="Admin Updated Item",
        ),
        headers=headers,
    )

    assert response.status_code == 200
    assert (
        response.json()["menu_item"]["name"]
        == "Admin Updated Item"
    )


def test_update_menu_item_owner_scope(client, db):
    owner1 = create_test_user(
        db,
        "Update Scope Owner One",
        "updatescopeowner1@test.com",
        role="owner",
    )

    owner2 = create_test_user(
        db,
        "Update Scope Owner Two",
        "updatescopeowner2@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner1.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
    )

    headers = login_user(
        client,
        owner2.email,
    )

    response = client.put(
        f"/api/menu-items/{menu_item.id}",
        data=update_menu_form(),
        headers=headers,
    )

    assert response.status_code == 403


def test_update_menu_item_not_found(client, db):
    owner = create_test_user(
        db,
        "Missing Update Owner",
        "missingupdateowner@test.com",
        role="owner",
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.put(
        "/api/menu-items/999999",
        data=update_menu_form(),
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Menu item not found"


def test_update_menu_item_validation(client, db):
    owner = create_test_user(
        db,
        "Update Validation Owner",
        "updatevalidationowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.put(
        f"/api/menu-items/{menu_item.id}",
        data=update_menu_form(
            name="A",
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Menu item name must contain at least 2 characters"
    )


def test_update_menu_item_with_image_url(client, db):
    owner = create_test_user(
        db,
        "Update Image URL Owner",
        "updateimageurlowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
        image="https://example.com/old.jpg",
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.put(
        f"/api/menu-items/{menu_item.id}",
        data=update_menu_form(
            image_url="https://example.com/new.jpg",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    item = response.json()["menu_item"]

    assert item["image"] == "https://example.com/new.jpg"


def test_update_menu_item_keeps_existing_image_when_no_new_image(
    client,
    db,
):
    owner = create_test_user(
        db,
        "Keep Image Owner",
        "keepimageowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
        image="https://example.com/existing.jpg",
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.put(
        f"/api/menu-items/{menu_item.id}",
        data=update_menu_form(
            name="Updated Name",
        ),
        headers=headers,
    )

    assert response.status_code == 200

    item = response.json()["menu_item"]

    assert item["image"] == "https://example.com/existing.jpg"


# ============================================================
# DELETE
# ============================================================

def test_delete_menu_item_as_owner(client, db):
    owner = create_test_user(
        db,
        "Delete Owner",
        "deletemenuowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.delete(
        f"/api/menu-items/{menu_item.id}",
        headers=headers,
    )

    assert response.status_code == 200

    assert (
        response.json()["message"]
        == "Menu item deleted successfully"
    )

    deleted_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == menu_item.id)
        .first()
    )

    assert deleted_item is None


def test_delete_menu_item_as_admin(client, db):
    admin = create_test_user(
        db,
        "Delete Admin",
        "deletemenuadmin@test.com",
        role="admin",
    )

    restaurant = create_test_restaurant(db)

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
    )

    headers = login_user(
        client,
        admin.email,
    )

    response = client.delete(
        f"/api/menu-items/{menu_item.id}",
        headers=headers,
    )

    assert response.status_code == 200


def test_delete_menu_item_owner_scope(client, db):
    owner1 = create_test_user(
        db,
        "Delete Scope Owner One",
        "deletescopeowner1@test.com",
        role="owner",
    )

    owner2 = create_test_user(
        db,
        "Delete Scope Owner Two",
        "deletescopeowner2@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner1.id,
    )

    menu_item = create_test_menu_item(
        db,
        restaurant.id,
    )

    headers = login_user(
        client,
        owner2.email,
    )

    response = client.delete(
        f"/api/menu-items/{menu_item.id}",
        headers=headers,
    )

    assert response.status_code == 403


def test_delete_menu_item_not_found(client, db):
    owner = create_test_user(
        db,
        "Missing Delete Owner",
        "missingdeleteowner@test.com",
        role="owner",
    )

    headers = login_user(
        client,
        owner.email,
    )

    response = client.delete(
        "/api/menu-items/999999",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Menu item not found"


def test_delete_uploaded_menu_image(client, db):
    owner = create_test_user(
        db,
        "Delete Image Owner",
        "deleteimageowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    create_response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="Image Delete Item",
        ),
        files={
            "image": (
                "delete.jpg",
                BytesIO(b"fake image"),
                "image/jpeg",
            )
        },
        headers=headers,
    )

    assert create_response.status_code == 200

    image_path = create_response.json()["menu_item"]["image"]

    file_path = Path(image_path.lstrip("/"))

    assert file_path.exists()

    menu_item_id = create_response.json()["menu_item"]["id"]

    delete_response = client.delete(
        f"/api/menu-items/{menu_item_id}",
        headers=headers,
    )

    assert delete_response.status_code == 200
    assert not file_path.exists()


def test_update_replaces_uploaded_image(client, db):
    owner = create_test_user(
        db,
        "Replace Image Owner",
        "replaceimageowner@test.com",
        role="owner",
    )

    restaurant = create_test_restaurant(
        db,
        owner_id=owner.id,
    )

    headers = login_user(
        client,
        owner.email,
    )

    create_response = client.post(
        "/api/menu-items/",
        data=menu_form(
            restaurant.id,
            name="Replace Image Item",
        ),
        files={
            "image": (
                "old.jpg",
                BytesIO(b"old image"),
                "image/jpeg",
            )
        },
        headers=headers,
    )

    assert create_response.status_code == 200

    item = create_response.json()["menu_item"]

    old_image = item["image"]
    old_file = Path(old_image.lstrip("/"))

    assert old_file.exists()

    update_response = client.put(
        f"/api/menu-items/{item['id']}",
        data=update_menu_form(
            name="Replaced Image Item",
        ),
        files={
            "image": (
                "new.jpg",
                BytesIO(b"new image"),
                "image/jpeg",
            )
        },
        headers=headers,
    )

    assert update_response.status_code == 200

    new_image = update_response.json()["menu_item"]["image"]
    new_file = Path(new_image.lstrip("/"))

    assert new_image != old_image
    assert new_file.exists()
    assert not old_file.exists()

    if new_file.exists():
        new_file.unlink()
