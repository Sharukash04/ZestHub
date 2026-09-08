import "./FeaturedRestaurants.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import pizza from "../../assets/images/pizza.jpg";
import restaurant1 from "../../assets/images/restaurant1.jpg";
import restaurant2 from "../../assets/images/restaurant2.jpg";
import restaurant3 from "../../assets/images/restaurant3.jpg";
import cafe from "../../assets/images/cafe.jpg";
import biryani from "../../assets/images/biryani.jpg";
import burger from "../../assets/images/burger.jpg";

function FeaturedRestaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
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

  // Convert backend image path into complete URL
  const getRestaurantImage = (image) => {
    // No image
    if (!image) {
      return pizza;
    }

    // Image uploaded through FastAPI
    if (image.startsWith("/uploads/")) {
      return `http://127.0.0.1:8000${image}`;
    }

    // Existing local image
    return imageMap[image] || pizza;
  };

  // Fetch restaurants
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/restaurants/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        return response.json();
      })
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Restaurant fetch error:", error);

        setError("Unable to load restaurants");
        setLoading(false);
      });
  }, []);

  return (
    <section className="featured">

      {/* Header */}
      <div className="featured-header">
        <h2>Featured Restaurants</h2>

        <p>
          Discover popular restaurants loved by food enthusiasts
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center" }}>
          Loading restaurants...
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            textAlign: "center",
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      {/* Restaurant Cards */}
      {!loading && !error && (
        <div className="restaurant-container">

          {restaurants.map((restaurant) => (
            <div
              className="restaurant-card"
              key={restaurant.id}
            >

              {/* Restaurant Image */}
              <img
                src={getRestaurantImage(restaurant.image)}
                alt={restaurant.name}
              />

              {/* Restaurant Information */}
              <div className="restaurant-info">

                <h3>
                  {restaurant.name}
                </h3>

                <div className="rating">
                  ⭐ {restaurant.average_rating ?? restaurant.rating}
                </div>

                <p>
                  📍 {restaurant.location}
                </p>

                <p>
                  🍽️ {restaurant.cuisine}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/restaurant/${restaurant.id}`
                    )
                  }
                >
                  View Details
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default FeaturedRestaurants;