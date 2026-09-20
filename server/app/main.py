from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app import models

from app.routes.restaurants import router as restaurant_router
from app.routes.categories import router as category_router
from app.routes.auth import router as auth_router
from app.routes.reviews import router as review_router
from app.routes.ratings import router as rating_router
from app.routes.favorites import router as favorite_router
from app.routes.menu_items import router as menu_item_router


app = FastAPI(
    title="ZestHub API",
    description="Restaurant Discovery and Review Platform API",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# DATABASE
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# STATIC FILES
# ---------------------------------------------------------

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

app.include_router(restaurant_router)
app.include_router(category_router)
app.include_router(auth_router)
app.include_router(review_router)
app.include_router(rating_router)
app.include_router(favorite_router)
app.include_router(menu_item_router)


# ---------------------------------------------------------
# ROOT ENDPOINT
# ---------------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to ZestHub API"
    }


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "ZestHub backend is running"
    }