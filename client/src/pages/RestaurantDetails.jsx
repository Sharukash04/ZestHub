import "./RestaurantDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import pizza from "../assets/images/pizza.jpg";
import restaurant1 from "../assets/images/restaurant1.jpg";
import restaurant2 from "../assets/images/restaurant2.jpg";
import restaurant3 from "../assets/images/restaurant3.jpg";
import cafe from "../assets/images/cafe.jpg";
import biryani from "../assets/images/biryani.jpg";
import burger from "../assets/images/burger.jpg";

function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Existing local restaurant images
  const imageMap = {
    "bella-italia.jpg": restaurant1,
    "trichy-kitchen.jpg": restaurant2,
    "barbeque-nation.jpg": restaurant3,
    "chinese-wok.jpg": restaurant1,
    "parashy-cafe.jpg": cafe,
    "hotel-kannappa.jpg": restaurant2,
    "kms-hakkim.jpg": restaurant3,
    "gorets-cafe.jpg": cafe,
    "cascade-cafe.jpg": cafe,
    "suvai-briyani.jpg": biryani,
    "grill-chicken.jpg": burger,
  };

  // Convert backend image into a usable browser URL
  const getRestaurantImage = (image) => {
    // No image
    if (!image) {
      return pizza;
    }

    // New image uploaded through FastAPI
    if (image.startsWith("/uploads/")) {
      return `http://127.0.0.1:8000${image}`;
    }

    // Existing local image
    return imageMap[image] || pizza;
  };

  // Fetch restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/api/restaurants/${id}`
        );

        if (!response.ok) {
          throw new Error("Restaurant not found");
        }

        const data = await response.json();

        console.log("Restaurant details:", data);

        setRestaurant(data);
      } catch (err) {
        console.error(
          "Restaurant details error:",
          err
        );

        setError(
          err.message || "Unable to load restaurant."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="restaurant-details-page">
        <div className="restaurant-details-loading">
          Loading restaurant...
        </div>
      </div>
    );
  }

  // Error
  if (error || !restaurant) {
    return (
      <div className="restaurant-details-page">
        <div className="restaurant-details-error">

          <h2>
            {error || "Restaurant not found"}
          </h2>

          <button
            onClick={() =>
              navigate("/restaurants")
            }
          >
            ← Back to Restaurants
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-details-page">

      <div className="restaurant-details-card">

        {/* Restaurant Image */}
        <div className="restaurant-details-image">

          <img
            src={getRestaurantImage(
              restaurant.image
            )}
            alt={restaurant.name}
          />

        </div>

        {/* Restaurant Information */}
        <div className="restaurant-details-info">

          <h1>
            {restaurant.name}
          </h1>

          {/* Rating */}
          <div className="restaurant-rating">

            <span className="star">
              ⭐
            </span>

            <span>
              {restaurant.average_rating ??
                restaurant.rating ??
                "0.0"}
            </span>

          </div>

          {/* Cuisine */}
          <div className="restaurant-detail-row">

            <span className="detail-icon">
              🍴
            </span>

            <span>
              <strong>Cuisine:</strong>{" "}
              {restaurant.cuisine}
            </span>

          </div>

          {/* Location */}
          <div className="restaurant-detail-row">

            <span className="detail-icon">
              📍
            </span>

            <span>
              <strong>Location:</strong>{" "}
              {restaurant.location}
            </span>

          </div>

          {/* Description */}
          <p className="restaurant-description">
            {restaurant.description ||
              "No description available for this restaurant."}
          </p>

          {/* Back Button */}
          <button
            className="back-restaurants-btn"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            ← Back to Restaurants
          </button>

        </div>

      </div>

    </div>
  );
}

export default RestaurantDetails;