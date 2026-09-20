from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Restaurant, Category, User
from app.auth import get_current_user, require_admin_or_owner

from pathlib import Path
from uuid import uuid4


router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"],
)


# ---------------------------------------------------------
# Upload configuration
# ---------------------------------------------------------

UPLOAD_DIR = Path("uploads/restaurants")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


def save_restaurant_image(image: UploadFile) -> str:
    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Image filename is missing",
        )

    extension = Path(image.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and WEBP images are allowed",
        )

    filename = f"{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(image.file.read())

    return f"/uploads/restaurants/{filename}"


# ---------------------------------------------------------
# Restaurant response helper
# ---------------------------------------------------------

def restaurant_response(restaurant: Restaurant):
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "location": restaurant.location,
        "cuisine": restaurant.cuisine,
        "rating": restaurant.average_rating,
        "average_rating": restaurant.average_rating,
        "description": restaurant.description,
        "image": restaurant.image,
        "category_id": restaurant.category_id,
        "owner_id": restaurant.owner_id,
    }


# ---------------------------------------------------------
# Check restaurant management permission
# ---------------------------------------------------------

def check_restaurant_permission(
    restaurant: Restaurant,
    current_user: User,
):
    """
    Admin can manage every restaurant.

    Owner can manage only restaurants assigned to that owner.

    Customers cannot manage restaurants.
    """

    if current_user.role == "admin":
        return

    if current_user.role == "owner":
        if restaurant.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only manage your own restaurants",
            )
        return

    raise HTTPException(
        status_code=403,
        detail="Restaurant owner or admin access required",
    )


# ---------------------------------------------------------
# GET ALL RESTAURANTS
# ---------------------------------------------------------
# Public endpoint
# Customers, owners and admins can view restaurants.

@router.get("/")
def get_restaurants(
    db: Session = Depends(get_db),
):
    restaurants = db.query(Restaurant).all()

    return [
        restaurant_response(restaurant)
        for restaurant in restaurants
    ]


# ---------------------------------------------------------
# GET SINGLE RESTAURANT
# ---------------------------------------------------------
# Public endpoint

@router.get("/{restaurant_id}")
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    return restaurant_response(restaurant)


# ---------------------------------------------------------
# CREATE RESTAURANT
# ---------------------------------------------------------
# Admin + Restaurant Owner only
#
# Admin:
#   owner_id = NULL
#
# Owner:
#   owner_id = current user's ID
#
# owner_id is NEVER accepted from the frontend.
# This prevents users from assigning restaurants to
# arbitrary accounts.

@router.post("/")
def create_restaurant(
    name: str = Form(...),
    location: str = Form(...),
    cuisine: str = Form(...),
    rating: float = Form(0.0),
    description: str | None = Form(None),
    category_id: int | None = Form(None),
    image: UploadFile = File(...),

    current_user: User = Depends(require_admin_or_owner),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------
    # Validate text fields
    # ---------------------------------------------

    name = name.strip()
    location = location.strip()
    cuisine = cuisine.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Restaurant name must contain at least 2 characters",
        )

    if len(name) > 150:
        raise HTTPException(
            status_code=400,
            detail="Restaurant name must not exceed 150 characters",
        )

    if len(location) < 2:
        raise HTTPException(
            status_code=400,
            detail="Location must contain at least 2 characters",
        )

    if len(cuisine) < 2:
        raise HTTPException(
            status_code=400,
            detail="Cuisine must contain at least 2 characters",
        )

    # ---------------------------------------------
    # Validate rating
    # ---------------------------------------------

    if rating < 0 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 0 and 5",
        )

    # ---------------------------------------------
    # Validate category
    # ---------------------------------------------

    if category_id is not None:
        category = (
            db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found",
            )

    # ---------------------------------------------
    # Save image
    # ---------------------------------------------

    image_path = save_restaurant_image(image)

    # ---------------------------------------------
    # Determine owner
    # ---------------------------------------------

    owner_id = None

    if current_user.role == "owner":
        owner_id = current_user.id

    # ---------------------------------------------
    # Create restaurant
    # ---------------------------------------------

    restaurant = Restaurant(
        name=name,
        location=location,
        cuisine=cuisine,
        average_rating=rating,
        description=description,
        image=image_path,
        category_id=category_id,
        owner_id=owner_id,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return {
        "message": "Restaurant created successfully",
        "restaurant": restaurant_response(restaurant),
    }


# ---------------------------------------------------------
# UPDATE RESTAURANT
# ---------------------------------------------------------
# Admin can update any restaurant.
#
# Owner can update only their own restaurant.

@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,

    name: str = Form(...),
    location: str = Form(...),
    cuisine: str = Form(...),
    rating: float = Form(0.0),
    description: str | None = Form(None),
    category_id: int | None = Form(None),

    image: UploadFile | None = File(None),

    current_user: User = Depends(require_admin_or_owner),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------
    # Find restaurant
    # ---------------------------------------------

    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    # ---------------------------------------------
    # Authorization
    # ---------------------------------------------

    check_restaurant_permission(
        restaurant,
        current_user,
    )

    # ---------------------------------------------
    # Validate fields
    # ---------------------------------------------

    name = name.strip()
    location = location.strip()
    cuisine = cuisine.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Restaurant name must contain at least 2 characters",
        )

    if len(name) > 150:
        raise HTTPException(
            status_code=400,
            detail="Restaurant name must not exceed 150 characters",
        )

    if len(location) < 2:
        raise HTTPException(
            status_code=400,
            detail="Location must contain at least 2 characters",
        )

    if len(cuisine) < 2:
        raise HTTPException(
            status_code=400,
            detail="Cuisine must contain at least 2 characters",
        )

    # ---------------------------------------------
    # Validate rating
    # ---------------------------------------------

    if rating < 0 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 0 and 5",
        )

    # ---------------------------------------------
    # Validate category
    # ---------------------------------------------

    if category_id is not None:
        category = (
            db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found",
            )

    # ---------------------------------------------
    # Update restaurant
    # ---------------------------------------------

    restaurant.name = name
    restaurant.location = location
    restaurant.cuisine = cuisine
    restaurant.average_rating = rating
    restaurant.description = description
    restaurant.category_id = category_id

    # ---------------------------------------------
    # Replace image only if a new image exists
    # ---------------------------------------------

    if image and image.filename:
        restaurant.image = save_restaurant_image(image)

    db.commit()
    db.refresh(restaurant)

    return {
        "message": "Restaurant updated successfully",
        "restaurant": restaurant_response(restaurant),
    }


# ---------------------------------------------------------
# DELETE RESTAURANT
# ---------------------------------------------------------
# Admin can delete any restaurant.
#
# Owner can delete only their own restaurant.

@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,

    current_user: User = Depends(require_admin_or_owner),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------
    # Find restaurant
    # ---------------------------------------------

    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    # ---------------------------------------------
    # Authorization
    # ---------------------------------------------

    check_restaurant_permission(
        restaurant,
        current_user,
    )

    # ---------------------------------------------
    # Delete
    # ---------------------------------------------

    db.delete(restaurant)
    db.commit()

    return {
        "message": "Restaurant deleted successfully",
    }