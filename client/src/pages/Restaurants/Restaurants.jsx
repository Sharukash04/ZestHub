import "./Restaurants.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaStar,
  FaUtensils,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

import API_URL from "../../config";

import {
  getRestaurantImage,
  FALLBACK_RESTAURANT_IMAGE,
} from "../../utils/restaurantImage";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Fetch restaurants from FastAPI
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/restaurants/`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRestaurants(data);
        } else {
          setRestaurants([]);
        }
      } catch (err) {
        console.error("Restaurant fetch error:", err);

        setError("Unable to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Search restaurants
  |--------------------------------------------------------------------------
  */

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchText = search.trim().toLowerCase();

    // Show everything when search is empty
    if (!searchText) {
      return true;
    }

    const name =
      restaurant.name?.toLowerCase() || "";

    const cuisine =
      restaurant.cuisine?.toLowerCase() || "";

    const location =
      restaurant.location?.toLowerCase() || "";

    return (
      name.includes(searchText) ||
      cuisine.includes(searchText) ||
      location.includes(searchText)
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Get restaurant rating
  |--------------------------------------------------------------------------
  */

  const getRating = (restaurant) => {
    const rating =
      restaurant.average_rating ??
      restaurant.rating ??
      0;

    const numericRating = Number(rating);

    if (!Number.isFinite(numericRating)) {
      return "0.0";
    }

    return numericRating.toFixed(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Get cuisine
  |--------------------------------------------------------------------------
  */

  const getCuisine = (restaurant) => {
    return restaurant.cuisine || "Various cuisines";
  };

  /*
  |--------------------------------------------------------------------------
  | Get location
  |--------------------------------------------------------------------------
  */

  const getLocation = (restaurant) => {
    return restaurant.location || "Location unavailable";
  };

  /*
  |--------------------------------------------------------------------------
  | Open restaurant details
  |--------------------------------------------------------------------------
  */

  const openRestaurant = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  return (
    <section className="restaurants-page">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="restaurants-header">

        <div>
          <h1>
            Discover Restaurants
          </h1>

          <p>
            Find the best places to eat, explore and share your experience.
          </p>
        </div>

      </div>


      {/* =========================================================
          SEARCH
      ========================================================= */}

      <div className="restaurant-search">

        <input
          type="text"
          placeholder="Search restaurants, cuisines or locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="button">
          Search
        </button>

      </div>


      {/* =========================================================
          FILTERS
      ========================================================= */}

      <div className="restaurant-filters">

        <button
          type="button"
          className="active"
        >
          All
        </button>

        <button type="button">
          Top Rated
        </button>

        <button type="button">
          Most Reviewed
        </button>

        <button type="button">
          Trending
        </button>

      </div>


      {/* =========================================================
          LOADING
      ========================================================= */}

      {loading && (
        <div className="restaurant-message">
          Loading restaurants...
        </div>
      )}


      {/* =========================================================
          ERROR
      ========================================================= */}

      {!loading && error && (
        <div className="restaurant-message error">
          {error}
        </div>
      )}


      {/* =========================================================
          NO RESULTS
      ========================================================= */}

      {!loading &&
        !error &&
        filteredRestaurants.length === 0 && (
          <div className="restaurant-message">
            No restaurants found.
          </div>
        )}


      {/* =========================================================
          RESTAURANT GRID
      ========================================================= */}

      {!loading &&
        !error &&
        filteredRestaurants.length > 0 && (

          <div className="restaurants-grid">

            {filteredRestaurants.map((restaurant) => {

              const image = getRestaurantImage(
                restaurant.image
              );

              const rating = getRating(
                restaurant
              );

              return (

                <article
                  className="restaurant-card"
                  key={restaurant.id}
                >

                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <div className="restaurant-card-image">

                    <img
                      src={image}
                      alt={
                        restaurant.name ||
                        "Restaurant"
                      }

                      onError={(event) => {
                        /*
                        Prevent infinite image-error loop.
                        */

                        if (
                          event.currentTarget.src !==
                          FALLBACK_RESTAURANT_IMAGE
                        ) {
                          event.currentTarget.src =
                            FALLBACK_RESTAURANT_IMAGE;
                        }
                      }}
                    />


                    {/* =============================================
                        RATING
                    ============================================= */}

                    <div className="restaurant-rating">

                      <FaStar />

                      <span>
                        {rating}
                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      RESTAURANT CONTENT
                  ================================================= */}

                  <div className="restaurant-card-content">

                    {/* Restaurant name */}

                    <h2>
                      {restaurant.name ||
                        "Restaurant"}
                    </h2>


                    {/* Cuisine */}

                    <div className="restaurant-detail">

                      <FaUtensils />

                      <span>
                        {getCuisine(
                          restaurant
                        )}
                      </span>

                    </div>


                    {/* Location */}

                    <div className="restaurant-detail">

                      <FaMapMarkerAlt />

                      <span>
                        {getLocation(
                          restaurant
                        )}
                      </span>

                    </div>


                    {/* =================================================
                        VIEW RESTAURANT
                    ================================================= */}

                    <button
                      type="button"
                      className="view-restaurant-button"

                      onClick={() =>
                        openRestaurant(
                          restaurant.id
                        )
                      }
                    >

                      <span>
                        View Restaurant
                      </span>

                      <FaArrowRight />

                    </button>

                  </div>

                </article>

              );
            })}

          </div>
        )}

    </section>
  );
}

export default Restaurants;