from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MenuItem, Restaurant, User
from app.auth import get_current_user, require_admin_or_owner


router = APIRouter(
    prefix="/api/menu-items",
    tags=["Menu Items"]
)


def menu_item_response(menu_item: MenuItem):
    return {
        "id": menu_item.id,
        "restaurant_id": menu_item.restaurant_id,
        "name": menu_item.name,
        "description": menu_item.description,
        "price": float(menu_item.price),
        "image": menu_item.image,
        "is_available": menu_item.is_available,
    }


def check_restaurant_permission(
    restaurant: Restaurant,
    current_user: User
):
    # Admin can manage any restaurant
    if current_user.role == "admin":
        return

    # Owner can manage only their own restaurant
    if current_user.role == "owner":
        if restaurant.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only manage menu items for your own restaurant"
            )
        return

    raise HTTPException(
        status_code=403,
        detail="Restaurant owner or admin access required"
    )


# ---------------------------------------------------------
# GET MENU ITEMS
# Public - customers can view restaurant menu
# ---------------------------------------------------------

@router.get("/restaurant/{restaurant_id}")
def get_restaurant_menu(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    menu_items = (
        db.query(MenuItem)
        .filter(MenuItem.restaurant_id == restaurant_id)
        .order_by(MenuItem.id.desc())
        .all()
    )

    return [
        menu_item_response(item)
        for item in menu_items
    ]


# ---------------------------------------------------------
# GET SINGLE MENU ITEM
# Public
# ---------------------------------------------------------

@router.get("/{menu_item_id}")
def get_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db)
):
    menu_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == menu_item_id)
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    return menu_item_response(menu_item)


# ---------------------------------------------------------
# CREATE MENU ITEM
# Owner/Admin only
# ---------------------------------------------------------

@router.post("/")
def create_menu_item(
    restaurant_id: int = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    price: str = Form(...),
    image: str | None = Form(None),
    is_available: bool = Form(True),
    current_user: User = Depends(require_admin_or_owner),
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
            detail="Restaurant not found"
        )

    check_restaurant_permission(
        restaurant,
        current_user
    )

    name = name.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Menu item name must contain at least 2 characters"
        )

    if len(name) > 150:
        raise HTTPException(
            status_code=400,
            detail="Menu item name must not exceed 150 characters"
        )

    try:
        price_value = Decimal(price)
    except (InvalidOperation, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Price must be a valid number"
        )

    if price_value < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    if price_value > Decimal("99999999.99"):
        raise HTTPException(
            status_code=400,
            detail="Price is too large"
        )

    menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=name,
        description=description.strip() if description else None,
        price=price_value,
        image=image.strip() if image else None,
        is_available=is_available,
    )

    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)

    return {
        "message": "Menu item created successfully",
        "menu_item": menu_item_response(menu_item)
    }


# ---------------------------------------------------------
# UPDATE MENU ITEM
# Owner/Admin only
# ---------------------------------------------------------

@router.put("/{menu_item_id}")
def update_menu_item(
    menu_item_id: int,
    name: str = Form(...),
    description: str | None = Form(None),
    price: str = Form(...),
    image: str | None = Form(None),
    is_available: bool = Form(True),
    current_user: User = Depends(require_admin_or_owner),
    db: Session = Depends(get_db),
):
    menu_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == menu_item_id)
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == menu_item.restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    check_restaurant_permission(
        restaurant,
        current_user
    )

    name = name.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Menu item name must contain at least 2 characters"
        )

    if len(name) > 150:
        raise HTTPException(
            status_code=400,
            detail="Menu item name must not exceed 150 characters"
        )

    try:
        price_value = Decimal(price)
    except (InvalidOperation, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Price must be a valid number"
        )

    if price_value < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    if price_value > Decimal("99999999.99"):
        raise HTTPException(
            status_code=400,
            detail="Price is too large"
        )

    menu_item.name = name
    menu_item.description = (
        description.strip()
        if description
        else None
    )
    menu_item.price = price_value
    menu_item.image = (
        image.strip()
        if image
        else None
    )
    menu_item.is_available = is_available

    db.commit()
    db.refresh(menu_item)

    return {
        "message": "Menu item updated successfully",
        "menu_item": menu_item_response(menu_item)
    }


# ---------------------------------------------------------
# DELETE MENU ITEM
# Owner/Admin only
# ---------------------------------------------------------

@router.delete("/{menu_item_id}")
def delete_menu_item(
    menu_item_id: int,
    current_user: User = Depends(require_admin_or_owner),
    db: Session = Depends(get_db),
):
    menu_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == menu_item_id)
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == menu_item.restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    check_restaurant_permission(
        restaurant,
        current_user
    )

    db.delete(menu_item)
    db.commit()

    return {
        "message": "Menu item deleted successfully"
    }