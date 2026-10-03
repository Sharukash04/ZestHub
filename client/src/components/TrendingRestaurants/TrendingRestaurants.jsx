import API_URL from "../../config";
import "./TrendingRestaurants.css";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaFire,
  FaStar,
  FaMapMarkerAlt,
  FaUtensils,
  FaArrowRight,
} from "react-icons/fa";

import {
  getRestaurantImage,
  FALLBACK_RESTAURANT_IMAGE,
} from "../../utils/restaurantImage";

function TrendingRestaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

        const sorted = (
          Array.isArray(data)
            ? data
            : []
        )
          .sort((a, b) => {
            const ratingA = Number(
              a.average_rating ??
                a.rating ??
                0
            );

            const ratingB = Number(
              b.average_rating ??
                b.rating ??
                0
            );

            return ratingB - ratingA;
          })
          .slice(0, 6);

        setRestaurants(sorted);
      } catch (error) {
        console.error(
          "Trending restaurants error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  return (
    <section className="trending">

      <div className="trending-header">

        <h2>
          <FaFire />
          Trending Restaurants
        </h2>

        <p>
          Discover places loved by the
          ZestHub community.
        </p>

      </div>

      {loading ? (

        <p
          style={{
            textAlign: "center",
          }}
        >
          Loading trending restaurants...
        </p>

      ) : (

        <div className="trending-container">

          {restaurants.map(
            (restaurant) => {

              const rating = Number(
                restaurant.average_rating ??
                  restaurant.rating ??
                  0
              );

              return (
                <div
                  className="trend-card"
                  key={restaurant.id}
                >

                  <div className="trend-image">

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

                  <div className="trend-info">

                    <h3>
                      {restaurant.name}
                    </h3>

                    <span className="rating">

                      <FaStar />

                      {rating > 0
                        ? rating.toFixed(1)
                        : "New"}

                    </span>

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
                      View Restaurant
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

export default TrendingRestaurants;