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

  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Fetch restaurants
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
        } else if (Array.isArray(data.value)) {
          setRestaurants(data.value);
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
  | Get restaurant rating
  |--------------------------------------------------------------------------
  */

  const getNumericRating = (restaurant) => {
    const rating =
      restaurant.average_rating ??
      restaurant.rating ??
      0;

    const numericRating = Number(rating);

    if (!Number.isFinite(numericRating)) {
      return 0;
    }

    return numericRating;
  };

  const getRating = (restaurant) => {
    return getNumericRating(restaurant).toFixed(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Get review count
  |--------------------------------------------------------------------------
  |
  | review_count now comes directly from the backend.
  | No additional review API request is required.
  |
  */

  const getReviewCount = (restaurant) => {
    const count = Number(
      restaurant.review_count ?? 0
    );

    if (!Number.isFinite(count)) {
      return 0;
    }

    return count;
  };

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const searchRestaurants = (restaurantList) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return restaurantList;
    }

    return restaurantList.filter((restaurant) => {
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
  };

  /*
  |--------------------------------------------------------------------------
  | Apply active filter
  |--------------------------------------------------------------------------
  */

  const applyFilter = (restaurantList) => {
    const filtered = [...restaurantList];

    /*
    |----------------------------------------------------------------------
    | Top Rated
    |----------------------------------------------------------------------
    */

    if (activeFilter === "top-rated") {
      return filtered.sort((a, b) => {
        return (
          getNumericRating(b) -
          getNumericRating(a)
        );
      });
    }

    /*
    |----------------------------------------------------------------------
    | Most Reviewed
    |----------------------------------------------------------------------
    */

    if (activeFilter === "most-reviewed") {
      return filtered.sort((a, b) => {
        const reviewDifference =
          getReviewCount(b) -
          getReviewCount(a);

        if (reviewDifference !== 0) {
          return reviewDifference;
        }

        return (
          getNumericRating(b) -
          getNumericRating(a)
        );
      });
    }

    /*
    |----------------------------------------------------------------------
    | Trending
    |----------------------------------------------------------------------
    */

    if (activeFilter === "trending") {
      return filtered.sort((a, b) => {
        const scoreA =
          getNumericRating(a) +
          getReviewCount(a) * 0.5;

        const scoreB =
          getNumericRating(b) +
          getReviewCount(b) * 0.5;

        return scoreB - scoreA;
      });
    }

    /*
    |----------------------------------------------------------------------
    | All
    |----------------------------------------------------------------------
    */

    return filtered;
  };

  /*
  |--------------------------------------------------------------------------
  | Search + filter
  |--------------------------------------------------------------------------
  */

  const filteredRestaurants = applyFilter(
    searchRestaurants(restaurants)
  );

  /*
  |--------------------------------------------------------------------------
  | Get cuisine
  |--------------------------------------------------------------------------
  */

  const getCuisine = (restaurant) => {
    return (
      restaurant.cuisine ||
      "Various cuisines"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Get location
  |--------------------------------------------------------------------------
  */

  const getLocation = (restaurant) => {
    return (
      restaurant.location ||
      "Location unavailable"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Open restaurant details
  |--------------------------------------------------------------------------
  */

  const openRestaurant = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  /*
  |--------------------------------------------------------------------------
  | Change filter
  |--------------------------------------------------------------------------
  */

  const changeFilter = (filter) => {
    setActiveFilter(filter);
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
          onChange={(e) =>
            setSearch(e.target.value)
          }
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
          className={
            activeFilter === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            changeFilter("all")
          }
        >
          All
        </button>

        <button
          type="button"
          className={
            activeFilter === "top-rated"
              ? "active"
              : ""
          }
          onClick={() =>
            changeFilter("top-rated")
          }
        >
          Top Rated
        </button>

        <button
          type="button"
          className={
            activeFilter === "most-reviewed"
              ? "active"
              : ""
          }
          onClick={() =>
            changeFilter("most-reviewed")
          }
        >
          Most Reviewed
        </button>

        <button
          type="button"
          className={
            activeFilter === "trending"
              ? "active"
              : ""
          }
          onClick={() =>
            changeFilter("trending")
          }
        >
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

            {filteredRestaurants.map(
              (restaurant) => {

                const image =
                  getRestaurantImage(
                    restaurant.image
                  );

                const rating =
                  getRating(restaurant);

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


                      {/* View Restaurant */}

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
              }
            )}

          </div>

        )}

    </section>
  );
}

export default Restaurants;