import API_URL from "../../config";
import "./FeaturedRestaurants.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaStar,
  FaMapMarkerAlt,
  FaUtensils,
  FaArrowRight,
} from "react-icons/fa";

import {
  getRestaurantImage,
  FALLBACK_RESTAURANT_IMAGE,
} from "../../utils/restaurantImage";

function FeaturedRestaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/restaurants/`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch restaurants"
          );
        }

        const data = await response.json();

        setRestaurants(
          Array.isArray(data)
            ? data.slice(0, 6)
            : []
        );
      } catch (err) {
        console.error(
          "Restaurant fetch error:",
          err
        );

        setError(
          "Unable to load restaurants."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  return (
    <section className="featured">

      <div className="featured-header">

        <h2>
          Featured Restaurants
        </h2>

        <p>
          Discover popular restaurants loved by
          food enthusiasts.
        </p>

      </div>

      {loading && (
        <p
          style={{
            textAlign: "center",
          }}
        >
          Loading restaurants...
        </p>
      )}

      {error && (
        <p
          style={{
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        restaurants.length > 0 && (

          <div className="restaurant-container">

            {restaurants.map(
              (restaurant) => {

                const rating = Number(
                  restaurant.average_rating ??
                    restaurant.rating ??
                    0
                );

                return (
                  <div
                    className="restaurant-card"
                    key={restaurant.id}
                  >

                    {/* IMAGE */}

                    <div className="restaurant-image-wrapper">

                      <img
                        src={getRestaurantImage(
                          restaurant.image
                        )}
                        alt={restaurant.name}
                        onError={(event) => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            FALLBACK_RESTAURANT_IMAGE;
                        }}
                      />

                    </div>

                    {/* INFO */}

                    <div className="restaurant-info">

                      <h3>
                        {restaurant.name}
                      </h3>

                      <div className="rating">

                        <FaStar />

                        <span>
                          {rating > 0
                            ? rating.toFixed(1)
                            : "New"}
                        </span>

                      </div>

                      <p>
                        <FaMapMarkerAlt />
                        {restaurant.location ||
                          "Location unavailable"}
                      </p>

                      <p>
                        <FaUtensils />
                        {restaurant.cuisine ||
                          "Restaurant"}
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
                        <FaArrowRight />
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </section>
  );
}

export default FeaturedRestaurants;