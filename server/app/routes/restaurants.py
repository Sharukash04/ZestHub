from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Restaurant, Category

from pathlib import Path
from uuid import uuid4


router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
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
    ".webp"
}


def save_restaurant_image(image: UploadFile) -> str:

    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Image filename is missing"
        )

    extension = Path(image.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and WEBP images are allowed"
        )

    filename = f"{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(image.file.read())

    return f"/uploads/restaurants/{filename}"


# ---------------------------------------------------------
# GET ALL RESTAURANTS
# ---------------------------------------------------------

@router.get("/")
def get_restaurants(db: Session = Depends(get_db)):

    restaurants = db.query(Restaurant).all()

    return [
        {
            "id": restaurant.id,
            "name": restaurant.name,
            "location": restaurant.location,
            "cuisine": restaurant.cuisine,
            "rating": restaurant.average_rating,
            "description": restaurant.description,
            "image": restaurant.image,
            "category_id": restaurant.category_id
        }
        for restaurant in restaurants
    ]


# ---------------------------------------------------------
# GET SINGLE RESTAURANT
# ---------------------------------------------------------

@router.get("/{restaurant_id}")
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "location": restaurant.location,
        "cuisine": restaurant.cuisine,
        "rating": restaurant.average_rating,
        "description": restaurant.description,
        "image": restaurant.image,
        "category_id": restaurant.category_id
    }


# ---------------------------------------------------------
# CREATE RESTAURANT
# ---------------------------------------------------------

@router.post("/")
def create_restaurant(
    name: str = Form(...),
    location: str = Form(...),
    cuisine: str = Form(...),
    rating: float = Form(0.0),
    description: str | None = Form(None),
    category_id: int | None = Form(None),
    image: UploadFile = File(...),

    db: Session = Depends(get_db)
):

    # Validate rating
    if rating < 0 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 0 and 5"
        )

    # Validate category
    if category_id is not None:

        category = db.query(Category).filter(
            Category.id == category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

    # Save image
    image_path = save_restaurant_image(image)

    # Create restaurant
    restaurant = Restaurant(
        name=name,
        location=location,
        cuisine=cuisine,
        average_rating=rating,
        description=description,
        image=image_path,
        category_id=category_id
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return {
        "message": "Restaurant created successfully",
        "restaurant": {
            "id": restaurant.id,
            "name": restaurant.name,
            "location": restaurant.location,
            "cuisine": restaurant.cuisine,
            "rating": restaurant.average_rating,
            "description": restaurant.description,
            "image": restaurant.image,
            "category_id": restaurant.category_id
        }
    }


# ---------------------------------------------------------
# UPDATE RESTAURANT
# ---------------------------------------------------------

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

    db: Session = Depends(get_db)
):

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    # Validate rating
    if rating < 0 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 0 and 5"
        )

    # Validate category
    if category_id is not None:

        category = db.query(Category).filter(
            Category.id == category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

    restaurant.name = name
    restaurant.location = location
    restaurant.cuisine = cuisine
    restaurant.average_rating = rating
    restaurant.description = description
    restaurant.category_id = category_id

    # Replace image only if a new image was selected
    if image and image.filename:
        restaurant.image = save_restaurant_image(image)

    db.commit()
    db.refresh(restaurant)

    return {
        "message": "Restaurant updated successfully",
        "restaurant": {
            "id": restaurant.id,
            "name": restaurant.name,
            "location": restaurant.location,
            "cuisine": restaurant.cuisine,
            "rating": restaurant.average_rating,
            "description": restaurant.description,
            "image": restaurant.image,
            "category_id": restaurant.category_id
        }
    }


# ---------------------------------------------------------
# DELETE RESTAURANT
# ---------------------------------------------------------

@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    db.delete(restaurant)
    db.commit()

    return {
        "message": "Restaurant deleted successfully"
    }