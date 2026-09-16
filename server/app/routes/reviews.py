from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Review, Restaurant, User
from app.auth import get_current_user


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)


# ---------------------------------------------------------
# REQUEST SCHEMA
# ---------------------------------------------------------

class ReviewCreate(BaseModel):
    restaurant_id: int
    comment: str = Field(
        ...,
        min_length=3,
        max_length=1000
    )


# ---------------------------------------------------------
# GET REVIEWS FOR A RESTAURANT
# ---------------------------------------------------------

@router.get("/restaurant/{restaurant_id}")
def get_restaurant_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    # Check restaurant exists
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return [
        {
            "id": review.id,
            "comment": review.comment,
            "created_at": review.created_at,
            "user_id": review.user_id,
            "user_name": review.user.name,
            "restaurant_id": review.restaurant_id
        }
        for review in reviews
    ]


# ---------------------------------------------------------
# CREATE REVIEW
# ---------------------------------------------------------

@router.post("/")
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check restaurant exists
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == review_data.restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    # Check duplicate review
    existing_review = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.id,
            Review.restaurant_id == review_data.restaurant_id
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this restaurant"
        )

    # Clean comment
    comment = review_data.comment.strip()

    if len(comment) < 3:
        raise HTTPException(
            status_code=400,
            detail="Review must contain at least 3 characters"
        )

    # Create review
    new_review = Review(
        comment=comment,
        user_id=current_user.id,
        restaurant_id=review_data.restaurant_id
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "message": "Review added successfully",
        "review": {
            "id": new_review.id,
            "comment": new_review.comment,
            "created_at": new_review.created_at,
            "user_id": new_review.user_id,
            "user_name": current_user.name,
            "restaurant_id": new_review.restaurant_id
        }
    }


# ---------------------------------------------------------
# DELETE OWN REVIEW
# ---------------------------------------------------------

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = db.query(Review).filter(
        Review.id == review_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    # Only review owner can delete
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own review"
        )

    db.delete(review)
    db.commit()

    return {
        "message": "Review deleted successfully"
    }