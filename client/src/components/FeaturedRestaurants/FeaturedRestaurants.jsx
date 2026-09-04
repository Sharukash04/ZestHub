import "./FeaturedRestaurants.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FeaturedRestaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      <div className="featured-header">

        <h2>
          Featured Restaurants
        </h2>

        <p>
          Discover popular restaurants loved by food enthusiasts
        </p>

      </div>

      {loading && (
        <p style={{ textAlign: "center" }}>
          Loading restaurants...
        </p>
      )}

      {error && (
        <p style={{ textAlign: "center", color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="restaurant-container">

          {restaurants.map((restaurant) => (

            <div
              className="restaurant-card"
              key={restaurant.id}
            >

              <img
                src={restaurant.image}
                alt={restaurant.name}
              />

              <div className="restaurant-info">

                <h3>
                  {restaurant.name}
                </h3>

                <div className="rating">
                  ⭐ {restaurant.rating}
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
                    navigate(`/restaurant/${restaurant.id}`)
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