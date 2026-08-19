from fastapi import APIRouter,HTTPException,Depends
from pydantic import BaseModel,Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Restaurant,Category


router=APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)


# -----------------------------
# Request Data
# -----------------------------

class RestaurantCreate(BaseModel):

    name:str=Field(
        min_length=2,
        max_length=150
    )

    location:str=Field(
        min_length=2,
        max_length=150
    )

    cuisine:str=Field(
        min_length=2,
        max_length=100
    )

    rating:float=Field(
        default=0.0,
        ge=0.0,
        le=5.0
    )

    description:str|None=None

    image:str|None=None

    category_id:int|None=None


# -----------------------------
# Response Helper
# -----------------------------

def restaurant_response(restaurant):

    return {
        "id":restaurant.id,
        "name":restaurant.name,
        "location":restaurant.location,
        "cuisine":restaurant.cuisine,
        "rating":restaurant.average_rating,
        "description":restaurant.description,
        "image":restaurant.image,
        "category_id":restaurant.category_id
    }


# -----------------------------
# GET ALL RESTAURANTS
# -----------------------------

@router.get("/")
def get_restaurants(
    db:Session=Depends(get_db)
):

    restaurants=(
        db.query(Restaurant)
        .order_by(Restaurant.id)
        .all()
    )

    return [
        restaurant_response(restaurant)
        for restaurant in restaurants
    ]


# -----------------------------
# GET RESTAURANT BY ID
# -----------------------------

@router.get("/{restaurant_id}")
def get_restaurant(
    restaurant_id:int,
    db:Session=Depends(get_db)
):

    restaurant=(
        db.query(Restaurant)
        .filter(Restaurant.id==restaurant_id)
        .first()
    )

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    return restaurant_response(restaurant)


# -----------------------------
# CREATE RESTAURANT
# -----------------------------

@router.post("/",status_code=201)
def create_restaurant(
    restaurant:RestaurantCreate,
    db:Session=Depends(get_db)
):

    # Check category exists
    if restaurant.category_id is not None:

        category=db.query(Category).filter(
            Category.id==restaurant.category_id
        ).first()

        if category is None:
            raise HTTPException(
                status_code=400,
                detail="Category not found"
            )

    new_restaurant=Restaurant(
        name=restaurant.name,
        location=restaurant.location,
        cuisine=restaurant.cuisine,
        description=restaurant.description,
        average_rating=restaurant.rating,
        image=restaurant.image,
        category_id=restaurant.category_id
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    return {
        "message":"Restaurant created successfully",
        "restaurant":restaurant_response(new_restaurant)
    }


# -----------------------------
# UPDATE RESTAURANT
# -----------------------------

@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id:int,
    restaurant:RestaurantCreate,
    db:Session=Depends(get_db)
):

    existing_restaurant=(
        db.query(Restaurant)
        .filter(Restaurant.id==restaurant_id)
        .first()
    )

    if existing_restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    # Check category exists
    if restaurant.category_id is not None:

        category=db.query(Category).filter(
            Category.id==restaurant.category_id
        ).first()

        if category is None:
            raise HTTPException(
                status_code=400,
                detail="Category not found"
            )

    existing_restaurant.name=restaurant.name
    existing_restaurant.location=restaurant.location
    existing_restaurant.cuisine=restaurant.cuisine
    existing_restaurant.description=restaurant.description
    existing_restaurant.average_rating=restaurant.rating
    existing_restaurant.image=restaurant.image
    existing_restaurant.category_id=restaurant.category_id

    db.commit()
    db.refresh(existing_restaurant)

    return {
        "message":"Restaurant updated successfully",
        "restaurant":restaurant_response(existing_restaurant)
    }


# -----------------------------
# DELETE RESTAURANT
# -----------------------------

@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id:int,
    db:Session=Depends(get_db)
):

    restaurant=(
        db.query(Restaurant)
        .filter(Restaurant.id==restaurant_id)
        .first()
    )

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    deleted_restaurant=restaurant_response(
        restaurant
    )

    db.delete(restaurant)
    db.commit()

    return {
        "message":"Restaurant deleted successfully",
        "restaurant":deleted_restaurant
    }