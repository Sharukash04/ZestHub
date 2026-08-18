# ZestHub - Progress Log

## Date
02-08-2026

## Completed
- Initialized React frontend
- Created reusable Navbar component
- Created Hero section component
- Applied component-specific CSS
- Organized project structure
- Learned React component architecture

## Date

Our Final ZestHub Backend
The target architecture should be:


                    ZestHub React
                         │
                         │ HTTP / JSON
                         ▼
                  ┌──────────────┐
                  │    FastAPI   │
                  └──────┬───────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
           Auth       Restaurants   Reviews
              │          │          │
              └──────────┼──────────┘
                         │
                    SQLAlchemy
                         │
                    PostgreSQL
                         │
              ┌──────────┼──────────┐
              │          │          │
            Users   Restaurants   Reviews
                       │
                 Ratings/Favorites


                Database Design

The recommend these tables:

users:
    id
    name
    email
    password_hash
    profile_image
    created_at
    updated_at
    restaurants
    id
    name
    description
    location
    address
    phone
    website
    image
    average_rating
    review_count
    category_id
    created_at
    updated_at
    
categories:
    id
    name
    description
    image

Examples:
    `
    South Indian
    North Indian
    Biryani
    Cafe
    Chinese
    Fast Food
    Desserts`

reviews
    id
    user_id
    restaurant_id
    comment
    rating
    created_at
    updated_at

favorites:
    id
    user_id
    restaurant_id
    created_at

restaurant_images:
    id
    restaurant_id
    image_url
    created_at

This gives us a much more realistic restaurant platform.

We'll improve it with:

1. Category support
Category
   ↓
Restaurant

For example:

South Indian
Cafe
Biryani
North Indian
Chinese
Fast Food
Desserts
2. Search
GET /api/restaurants/search?query=biryani
3. Location filtering
GET /api/restaurants?location=Trichy
4. Cuisine filtering
GET /api/restaurants?cuisine=South Indian
5. Pagination

Instead of returning 10,000 restaurants at once:

GET /api/restaurants?page=1&limit=10
6. Proper rating system

Eventually we shouldn't let someone simply set:

"rating": 5

on a restaurant.

🎯 Our backend roadmap now

                    ZestHub Backend
                           │
          ┌────────────────┴────────────────┐
          ↓                                 ↓
    PostgreSQL ✅                     FastAPI ✅
          │                                 │
          └──────────────┬──────────────────┘
                         ↓
                 Restaurant CRUD ✅
                         ↓
              Restaurant Features ← NEXT
                         ↓
                  Authentication
                         ↓
                    Reviews
                         ↓
                    Ratings
                         ↓
                   Favorites
                         ↓
                Search & Filters
                         ↓
                   API Security
                         ↓
                 Testing & Errors
                         ↓
              React Frontend Integration
                         ↓
                     Deployment