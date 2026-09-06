import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RestaurantDetails.css";

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

  const imageMap = {
    "pizza.jpg": pizza,
    "restaurant1.jpg": restaurant1,
    "restaurant2.jpg": restaurant2,
    "restaurant3.jpg": restaurant3,
    "cafe.jpg": cafe,
    "biryani.jpg": biryani,
    "burger.jpg": burger,
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/restaurants/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Restaurant not found");
        }

        return response.json();
      })
      .then((data) => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load restaurant details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="details-page">
        <h2>Loading restaurant...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <h2>{error}</h2>

        <button
          className="back-btn"
          onClick={() => navigate("/restaurants")}
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="details-page">

      <div className="details-card">

        <img
          src={imageMap[restaurant.image] || pizza}
          alt={restaurant.name}
          className="details-image"
        />

        <div className="details-content">

          <h1>{restaurant.name}</h1>

          <div className="details-rating">
            ⭐ {restaurant.rating}
          </div>

          <p>
            🍴 <strong>Cuisine:</strong> {restaurant.cuisine}
          </p>

          <p>
            📍 <strong>Location:</strong> {restaurant.location}
          </p>

          <p className="details-description">
            {restaurant.description}
          </p>

          <button
            className="back-btn"
            onClick={() => navigate("/restaurants")}
          >
            ← Back to Restaurants
          </button>

        </div>

      </div>

    </div>
  );
}

export default RestaurantDetails;