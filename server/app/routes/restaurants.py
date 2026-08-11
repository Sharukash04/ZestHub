from fastapi import APIRouter

router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)


restaurants = [
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


@router.get("/")
def get_restaurants():
    return restaurants


@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int):

    for restaurant in restaurants:

        if restaurant["id"] == restaurant_id:
            return restaurant

    return {
        "message": "Restaurant not found"
    }