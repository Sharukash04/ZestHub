from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    reviews = relationship("Review", back_populates="user")
    ratings = relationship("Rating", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(100), unique=True, nullable=False)
    restaurants=relationship("Restaurant", back_populates="category")
class Restaurant(Base):
    __tablename__="restaurants"
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(150), nullable=False)
    location=Column(String(150), nullable=False)
    cuisine=Column(String(100), nullable=False)
    description=Column(Text)
    image=Column(String(255))
    average_rating=Column(Float, default=0.0)
    category_id=Column(Integer, ForeignKey("categories.id"))
    category=relationship("Category", back_populates="restaurants")
    reviews=relationship("Review", back_populates="restaurant")
    ratings=relationship("Rating", back_populates="restaurant")
    favorites=relationship("Favorite", back_populates="restaurant")
class Review(Base):
    __tablename__="reviews"
    id=Column(Integer, primary_key=True, index=True)
    comment=Column(Text, nullable=False)
    created_at=Column(DateTime, default=datetime.utcnow)
    user_id=Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id=Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user=relationship("User", back_populates="reviews")
    restaurant=relationship("Restaurant", back_populates="reviews")
class Rating(Base):
    __tablename__="ratings"
    id=Column(Integer, primary_key=True, index=True)
    rating=Column(Float, nullable=False)
    user_id=Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id=Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user=relationship("User", back_populates="ratings")
    restaurant=relationship("Restaurant", back_populates="ratings")
class Favorite(Base):
    __tablename__="favorites"
    id=Column(Integer, primary_key=True, index=True)
    user_id=Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id=Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user=relationship("User", back_populates="favorites")
    restaurant=relationship("Restaurant", back_populates="favorites")