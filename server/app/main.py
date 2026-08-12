from fastapi import FastAPI

from app.database import Base, engine
from app import models

from app.routes.restaurants import router as restaurant_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ZestHub API",
    description="Restaurant Discovery and Review Platform API",
    version="1.0.0"
)


app.include_router(restaurant_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to ZestHub API"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "ZestHub backend is running"
    }