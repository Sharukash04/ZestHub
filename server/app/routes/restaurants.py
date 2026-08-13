from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router =APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)
# Temporary restaurant storage
restaurants=[
    {
        "id": 1,
        "name": "Spice Garden",
        "location": "Trichy",
        "cuisine": "South Indian",
        "rating": 4.8,
        "image": "restaurant1.jpg"
    },
    {
        "id": 2,
        "name": "Urban Cafe",
        "location": "Chennai",
        "cuisine": "Cafe & Beverages",
        "rating": 4.6,
        "image": "restaurant2.jpg"
    },
    {
        "id": 3,
        "name": "Royal Biryani House",
        "location": "Madurai",
        "cuisine": "Biryani",
        "rating": 4.9,
        "image": "restaurant3.jpg"
    }
]
# Data format for creating a restaurant
class RestaurantCreate(BaseModel):
    name: str
    location: str
    cuisine: str
    rating: float
    image: str
# GET all restaurants
@router.get("/")
def get_restaurants():
    return restaurants
# GET restaurant by ID
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int):

    for restaurant in restaurants:
        if restaurant["id"]==restaurant_id:
            return restaurant

    raise HTTPException(
        status_code=404,
        detail="Restaurant not found"
    )
# POST create restaurant
@router.post("/")
def create_restaurant(restaurant: RestaurantCreate):

    new_id = max([r["id"] for r in restaurants], default=0) + 1

    new_restaurant={
        "id": new_id,
        "name": restaurant.name,
        "location": restaurant.location,
        "cuisine": restaurant.cuisine,
        "rating": restaurant.rating,
        "image": restaurant.image
    }

    restaurants.append(new_restaurant)

    return {
        "message": "Restaurant created successfully",
        "restaurant": new_restaurant
    }


# PUT update restaurant
@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    restaurant: RestaurantCreate
):

    for index, existing in enumerate(restaurants):

        if existing["id"]==restaurant_id:

            updated_restaurant = {
                "id": restaurant_id,
                "name": restaurant.name,
                "location": restaurant.location,
                "cuisine": restaurant.cuisine,
                "rating": restaurant.rating,
                "image": restaurant.image
            }

            restaurants[index]=updated_restaurant

            return {
                "message": "Restaurant updated successfully",
                "restaurant": updated_restaurant
            }

    raise HTTPException(
        status_code=404,
        detail="Restaurant not found"
    )


# DELETE restaurant
@router.delete("/{restaurant_id}")
def delete_restaurant(restaurant_id: int):

    for index, restaurant in enumerate(restaurants):

        if restaurant["id"]==restaurant_id:

            deleted = restaurants.pop(index)

            return {
                "message": "Restaurant deleted successfully",
                "restaurant": deleted
            }

    raise HTTPException(
        status_code=404,
        detail="Restaurant not found"
    )