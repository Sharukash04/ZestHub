from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Favorite, Restaurant, User
from app.auth import get_current_user


router = APIRouter(
    prefix="/api/favorites",
    tags=["Favorites"]
)


@router.get("/restaurant/{restaurant_id}")
def check_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    return {
        "restaurant_id": restaurant_id,
        "is_favorite": favorite is not None
    }


@router.post("/restaurant/{restaurant_id}")
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    if existing_favorite:
        return {
            "message": "Restaurant is already in your favorites",
            "is_favorite": True
        }

    new_favorite = Favorite(
        user_id=current_user.id,
        restaurant_id=restaurant_id
    )

    db.add(new_favorite)
    db.commit()

    return {
        "message": "Restaurant added to favorites",
        "is_favorite": True
    }


@router.delete("/restaurant/{restaurant_id}")
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Restaurant is not in your favorites"
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Restaurant removed from favorites",
        "is_favorite": False
    }


@router.get("/my-favorites")
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .all()
    )

    result = []

    for favorite in favorites:
        restaurant = db.query(Restaurant).filter(
            Restaurant.id == favorite.restaurant_id
        ).first()

        if restaurant:
            result.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "location": restaurant.location,
                "cuisine": restaurant.cuisine,
                "description": restaurant.description,
                "image": restaurant.image,
                "rating": restaurant.average_rating,
                "category_id": restaurant.category_id
            })

    return result