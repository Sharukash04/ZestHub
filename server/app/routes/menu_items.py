from decimal import Decimal, InvalidOperation
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Form,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MenuItem, Restaurant, User
from app.auth import require_admin_or_owner


router = APIRouter(
    prefix="/api/menu-items",
    tags=["Menu Items"]
)


# ============================================================
# UPLOAD SETTINGS
# ============================================================

UPLOAD_DIR = Path("uploads/menu")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ============================================================
# RESPONSE HELPER
# ============================================================

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


# ============================================================
# RESTAURANT PERMISSION
# ============================================================

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
                detail=(
                    "You can only manage menu items "
                    "for your own restaurant"
                ),
            )
        return

    raise HTTPException(
        status_code=403,
        detail="Restaurant owner or admin access required",
    )


# ============================================================
# SAVE MENU IMAGE
# ============================================================

def save_menu_image(image: UploadFile) -> str:
    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Image filename is missing",
        )

    extension = Path(image.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG and WEBP "
                "images are allowed"
            ),
        )

    file_content = image.file.read()

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size must not exceed 5 MB",
        )

    filename = f"{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    return f"/uploads/menu/{filename}"


# ============================================================
# DELETE OLD MENU IMAGE
# ============================================================

def delete_menu_image(image_path: str | None):
    if not image_path:
        return

    if not image_path.startswith("/uploads/menu/"):
        return

    file_path = Path(image_path.lstrip("/"))

    if file_path.exists():
        try:
            file_path.unlink()
        except OSError:
            pass


# ============================================================
# GET ALL MENU ITEMS FOR A RESTAURANT
# ============================================================

@router.get("/restaurant/{restaurant_id}")
def get_restaurant_menu(
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


# ============================================================
# GET SINGLE MENU ITEM
# ============================================================

@router.get("/{menu_item_id}")
def get_menu_item(
    menu_item_id: int,
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
            detail="Menu item not found",
        )

    return menu_item_response(menu_item)


# ============================================================
# CREATE MENU ITEM
# ============================================================

@router.post("/")
def create_menu_item(
    restaurant_id: int = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    price: str = Form(...),
    image_url: str | None = Form(None),
    is_available: bool = Form(True),
    image: UploadFile | None = File(None),
    current_user: User = Depends(
        require_admin_or_owner
    ),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Restaurant
    # --------------------------------------------------------

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

    check_restaurant_permission(
        restaurant,
        current_user,
    )

    # --------------------------------------------------------
    # Name validation
    # --------------------------------------------------------

    name = name.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "Menu item name must contain "
                "at least 2 characters"
            ),
        )

    if len(name) > 150:
        raise HTTPException(
            status_code=400,
            detail=(
                "Menu item name must not exceed "
                "150 characters"
            ),
        )

    # --------------------------------------------------------
    # Price validation
    # --------------------------------------------------------

    try:
        price_value = Decimal(price)
    except (InvalidOperation, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Price must be a valid number",
        )

    if price_value < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative",
        )

    if price_value > Decimal("99999999.99"):
        raise HTTPException(
            status_code=400,
            detail="Price is too large",
        )

    # --------------------------------------------------------
    # Image handling
    # --------------------------------------------------------

    image_path = None

    if image and image.filename:
        image_path = save_menu_image(image)

    elif image_url and image_url.strip():
        image_path = image_url.strip()

    # --------------------------------------------------------
    # Create menu item
    # --------------------------------------------------------

    menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=name,
        description=(
            description.strip()
            if description
            else None
        ),
        price=price_value,
        image=image_path,
        is_available=is_available,
    )

    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)

    return {
        "message": "Menu item created successfully",
        "menu_item": menu_item_response(menu_item),
    }


# ============================================================
# UPDATE MENU ITEM
# ============================================================

@router.put("/{menu_item_id}")
def update_menu_item(
    menu_item_id: int,
    name: str = Form(...),
    description: str | None = Form(None),
    price: str = Form(...),
    image_url: str | None = Form(None),
    is_available: bool = Form(True),
    image: UploadFile | None = File(None),
    current_user: User = Depends(
        require_admin_or_owner
    ),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find menu item
    # --------------------------------------------------------

    menu_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == menu_item_id)
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found",
        )

    # --------------------------------------------------------
    # Find restaurant
    # --------------------------------------------------------

    restaurant = (
        db.query(Restaurant)
        .filter(
            Restaurant.id == menu_item.restaurant_id
        )
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    check_restaurant_permission(
        restaurant,
        current_user,
    )

    # --------------------------------------------------------
    # Name validation
    # --------------------------------------------------------

    name = name.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "Menu item name must contain "
                "at least 2 characters"
            ),
        )

    if len(name) > 150:
        raise HTTPException(
            status_code=400,
            detail=(
                "Menu item name must not exceed "
                "150 characters"
            ),
        )

    # --------------------------------------------------------
    # Price validation
    # --------------------------------------------------------

    try:
        price_value = Decimal(price)
    except (InvalidOperation, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Price must be a valid number",
        )

    if price_value < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative",
        )

    if price_value > Decimal("99999999.99"):
        raise HTTPException(
            status_code=400,
            detail="Price is too large",
        )

    # --------------------------------------------------------
    # Image handling
    # --------------------------------------------------------

    old_image = menu_item.image
    new_image = old_image

    # New uploaded image
    if image and image.filename:
        new_image = save_menu_image(image)

    # New URL
    elif image_url and image_url.strip():
        new_image = image_url.strip()

    # Empty image field means keep existing image
    # so editing other fields does not accidentally
    # remove the current image.

    # --------------------------------------------------------
    # Update menu item
    # --------------------------------------------------------

    menu_item.name = name

    menu_item.description = (
        description.strip()
        if description
        else None
    )

    menu_item.price = price_value

    menu_item.image = new_image

    menu_item.is_available = is_available

    db.commit()
    db.refresh(menu_item)

    # --------------------------------------------------------
    # Delete old uploaded image if replaced
    # --------------------------------------------------------

    if (
        old_image
        and new_image != old_image
        and old_image.startswith("/uploads/menu/")
    ):
        delete_menu_image(old_image)

    return {
        "message": "Menu item updated successfully",
        "menu_item": menu_item_response(menu_item),
    }


# ============================================================
# DELETE MENU ITEM
# ============================================================

@router.delete("/{menu_item_id}")
def delete_menu_item(
    menu_item_id: int,
    current_user: User = Depends(
        require_admin_or_owner
    ),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find menu item
    # --------------------------------------------------------

    menu_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == menu_item_id)
        .first()
    )

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found",
        )

    # --------------------------------------------------------
    # Find restaurant
    # --------------------------------------------------------

    restaurant = (
        db.query(Restaurant)
        .filter(
            Restaurant.id == menu_item.restaurant_id
        )
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    check_restaurant_permission(
        restaurant,
        current_user,
    )

    # --------------------------------------------------------
    # Delete image
    # --------------------------------------------------------

    delete_menu_image(menu_item.image)

    # --------------------------------------------------------
    # Delete database record
    # --------------------------------------------------------

    db.delete(menu_item)
    db.commit()

    return {
        "message": "Menu item deleted successfully"
    }