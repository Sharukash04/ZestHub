from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category


router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)


# -----------------------------
# Request Data
# -----------------------------

class CategoryCreate(BaseModel):
    name: str


# -----------------------------
# GET ALL CATEGORIES
# -----------------------------

@router.get("/")
def get_categories(
    db: Session = Depends(get_db)
):

    categories = db.query(Category).all()

    return categories


# -----------------------------
# GET CATEGORY BY ID
# -----------------------------

@router.get("/{category_id}")
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


# -----------------------------
# CREATE CATEGORY
# -----------------------------

@router.post("/", status_code=201)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):

    existing_category = (
        db.query(Category)
        .filter(Category.name == category.name)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    new_category = Category(
        name=category.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "message": "Category created successfully",
        "category": new_category
    }


# -----------------------------
# UPDATE CATEGORY
# -----------------------------

@router.put("/{category_id}")
def update_category(
    category_id: int,
    category: CategoryCreate,
    db: Session = Depends(get_db)
):

    existing_category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if existing_category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    existing_category.name = category.name

    db.commit()
    db.refresh(existing_category)

    return {
        "message": "Category updated successfully",
        "category": existing_category
    }


# -----------------------------
# DELETE CATEGORY
# -----------------------------

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    db.delete(category)
    db.commit()

    return {
        "message": "Category deleted successfully"
    }