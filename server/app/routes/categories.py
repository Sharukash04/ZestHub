from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category


router=APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)


# -----------------------------
# Request Data
# -----------------------------

class CategoryCreate(BaseModel):
    name:str=Field(
        min_length=2,
        max_length=100
    )


# -----------------------------
# Response Helper
# -----------------------------

def category_response(category):
    return {
        "id":category.id,
        "name":category.name
    }


# -----------------------------
# GET ALL CATEGORIES
# -----------------------------

@router.get("/")
def get_categories(
    db:Session=Depends(get_db)
):

    categories=db.query(Category).all()

    return [
        category_response(category)
        for category in categories
    ]


# -----------------------------
# GET CATEGORY BY ID
# -----------------------------

@router.get("/{category_id}")
def get_category(
    category_id:int,
    db:Session=Depends(get_db)
):

    category=(
        db.query(Category)
        .filter(Category.id==category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category_response(category)


# -----------------------------
# CREATE CATEGORY
# -----------------------------

@router.post("/",status_code=201)
def create_category(
    category:CategoryCreate,
    db:Session=Depends(get_db)
):

    existing_category=(
        db.query(Category)
        .filter(Category.name==category.name)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=409,
            detail="Category already exists"
        )

    new_category=Category(
        name=category.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "message":"Category created successfully",
        "category":category_response(new_category)
    }


# -----------------------------
# UPDATE CATEGORY
# -----------------------------

@router.put("/{category_id}")
def update_category(
    category_id:int,
    category:CategoryCreate,
    db:Session=Depends(get_db)
):

    existing_category=(
        db.query(Category)
        .filter(Category.id==category_id)
        .first()
    )

    if existing_category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    duplicate_category=(
        db.query(Category)
        .filter(
            Category.name==category.name,
            Category.id!=category_id
        )
        .first()
    )

    if duplicate_category:
        raise HTTPException(
            status_code=409,
            detail="Category already exists"
        )

    existing_category.name=category.name

    db.commit()
    db.refresh(existing_category)

    return {
        "message":"Category updated successfully",
        "category":category_response(existing_category)
    }


# -----------------------------
# DELETE CATEGORY
# -----------------------------

@router.delete("/{category_id}")
def delete_category(
    category_id:int,
    db:Session=Depends(get_db)
):

    category=(
        db.query(Category)
        .filter(Category.id==category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    deleted_category=category_response(category)

    db.delete(category)
    db.commit()

    return {
        "message":"Category deleted successfully",
        "category":deleted_category
    }