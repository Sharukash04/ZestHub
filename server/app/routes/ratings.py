from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Rating, Restaurant, User
from app.auth import get_current_user


router = APIRouter(
    prefix="/api/ratings",
    tags=["Ratings"]
)


# =========================================================
# REQUEST SCHEMAS
# =========================================================

class RatingCreate(BaseModel):
    restaurant_id: int
    rating: float = Field(
        ...,
        ge=1,
        le=5
    )


class RestaurantRatingCreate(BaseModel):
    rating: float = Field(
        ...,
        ge=1,
        le=5
    )


# =========================================================
# HELPER - UPDATE RESTAURANT AVERAGE
# =========================================================

def update_average_rating(
    restaurant_id: int,
    db: Session
):

    ratings = db.query(Rating).filter(
        Rating.restaurant_id == restaurant_id
    ).all()

    if not ratings:
        average = 0.0
    else:
        total = sum(float(r.rating) for r in ratings)
        average = round(total / len(ratings), 1)

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant:
        restaurant.average_rating = average

    return average


# =========================================================
# GET RESTAURANT RATING
# =========================================================

@router.get("/restaurant/{restaurant_id}")
def get_restaurant_rating(
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

    ratings = db.query(Rating).filter(
        Rating.restaurant_id == restaurant_id
    ).all()

    average = (
        round(
            sum(float(r.rating) for r in ratings) / len(ratings),
            1
        )
        if ratings
        else 0.0
    )

    return {
        "restaurant_id": restaurant_id,
        "average_rating": average,
        "total_ratings": len(ratings)
    }


# =========================================================
# GET CURRENT USER'S RATING
# =========================================================

@router.get("/restaurant/{restaurant_id}/my-rating")
def get_my_rating(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    rating = db.query(Rating).filter(
        Rating.restaurant_id == restaurant_id,
        Rating.user_id == current_user.id
    ).first()

    if not rating:
        return {
            "has_rated": False,
            "rating": None
        }

    return {
        "has_rated": True,
        "rating": float(rating.rating)
    }


# =========================================================
# CREATE / UPDATE RATING
#
# React uses:
# POST /api/ratings/restaurant/{restaurant_id}
#
# Body:
# {
#     "rating": 4
# }
# =========================================================

@router.post("/restaurant/{restaurant_id}")
def create_or_update_restaurant_rating(
    restaurant_id: int,
    rating_data: RestaurantRatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check restaurant
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    # Check existing user rating
    existing_rating = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.restaurant_id == restaurant_id
    ).first()

    # -----------------------------------------------------
    # UPDATE EXISTING RATING
    # -----------------------------------------------------

    if existing_rating:

        existing_rating.rating = rating_data.rating

        db.flush()

        average = update_average_rating(
            restaurant_id,
            db
        )

        db.commit()
        db.refresh(existing_rating)

        return {
            "message": "Rating updated successfully",
            "rating": float(existing_rating.rating),
            "average_rating": average
        }

    # -----------------------------------------------------
    # CREATE NEW RATING
    # -----------------------------------------------------

    new_rating = Rating(
        rating=rating_data.rating,
        user_id=current_user.id,
        restaurant_id=restaurant_id
    )

    db.add(new_rating)

    db.flush()

    average = update_average_rating(
        restaurant_id,
        db
    )

    db.commit()
    db.refresh(new_rating)

    return {
        "message": "Rating added successfully",
        "rating": float(new_rating.rating),
        "average_rating": average
    }


# =========================================================
# ORIGINAL CREATE / UPDATE ENDPOINT
#
# POST /api/ratings/
#
# Kept for compatibility with other parts of ZestHub.
# =========================================================

@router.post("/")
def create_or_update_rating(
    rating_data: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == rating_data.restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    existing_rating = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.restaurant_id == rating_data.restaurant_id
    ).first()

    if existing_rating:

        existing_rating.rating = rating_data.rating

        db.flush()

        average = update_average_rating(
            rating_data.restaurant_id,
            db
        )

        db.commit()
        db.refresh(existing_rating)

        return {
            "message": "Rating updated successfully",
            "rating": float(existing_rating.rating),
            "average_rating": average
        }

    new_rating = Rating(
        rating=rating_data.rating,
        user_id=current_user.id,
        restaurant_id=rating_data.restaurant_id
    )

    db.add(new_rating)

    db.flush()

    average = update_average_rating(
        rating_data.restaurant_id,
        db
    )

    db.commit()
    db.refresh(new_rating)

    return {
        "message": "Rating added successfully",
        "rating": float(new_rating.rating),
        "average_rating": average
    }


# =========================================================
# DELETE CURRENT USER'S RATING
# =========================================================

@router.delete("/restaurant/{restaurant_id}")
def delete_my_rating(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    rating = db.query(Rating).filter(
        Rating.restaurant_id == restaurant_id,
        Rating.user_id == current_user.id
    ).first()

    if not rating:
        raise HTTPException(
            status_code=404,
            detail="Rating not found"
        )

    db.delete(rating)

    db.flush()

    average = update_average_rating(
        restaurant_id,
        db
    )

    db.commit()

    return {
        "message": "Rating deleted successfully",
        "average_rating": average
    }