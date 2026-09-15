import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

import biryani from "../../assets/images/biryani.jpg";
import cafe from "../../assets/images/cafe.jpg";
import desserts from "../../assets/images/desserts.jpg";
import heroFood from "../../assets/images/hero-food.jpg";
import keralaFoodCourt from "../../assets/images/Kerala Food Court.jpg";
import restaurant1 from "../../assets/images/restaurant1.jpg";
import restaurant2 from "../../assets/images/restaurant2.jpg";
import restaurant3 from "../../assets/images/restaurant3.jpg";

const API_URL = "http://127.0.0.1:8000";

const imageMap = {
  "chinese-wok.jpg": restaurant1,
  "gorets-cafe.jpg": cafe,
  "cascade-cafe.jpg": restaurant2,
  "grill-chicken.jpg": restaurant3,
  "biryani.jpg": biryani,
  "cafe.jpg": cafe,
  "desserts.jpg": desserts,
  "hero-food.jpg": heroFood,
  "Kerala Food Court.jpg": keralaFoodCourt,
  "restaurant1.jpg": restaurant1,
  "restaurant2.jpg": restaurant2,
  "restaurant3.jpg": restaurant3,
};

const getRestaurantImage = (image) => {
  if (!image) return heroFood;

  if (image.startsWith("/uploads/")) {
    return `${API_URL}${image}`;
  }

  if (imageMap[image]) {
    return imageMap[image];
  }

  return heroFood;
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("zesthub_token");
    const storedUser = localStorage.getItem("zesthub_user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to read stored user:", error);
      }
    }

    fetchRestaurants(token);
  }, [navigate]);

  const fetchRestaurants = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/restaurants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      const restaurantList = Array.isArray(data)
        ? data
        : data?.value || [];

      setRestaurants(restaurantList);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRating = (restaurant) => {
    const rating = Number(restaurant.rating);

    if (!rating || rating <= 0) {
      return "New";
    }

    return rating.toFixed(1);
  };

  /*
   * GET UNIQUE CUISINES
   */
  const cuisines = useMemo(() => {
    return [
      ...new Set(
        restaurants
          .map((restaurant) => restaurant.cuisine)
          .filter(Boolean)
      ),
    ].sort();
  }, [restaurants]);

  /*
   * GET UNIQUE LOCATIONS
   */
  const locations = useMemo(() => {
    return [
      ...new Set(
        restaurants
          .map((restaurant) => restaurant.location)
          .filter(Boolean)
      ),
    ].sort();
  }, [restaurants]);

  /*
   * SEARCH + FILTER
   */
  const filteredRestaurants = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const name =
        restaurant.name?.toLowerCase() || "";

      const location =
        restaurant.location?.toLowerCase() || "";

      const cuisine =
        restaurant.cuisine?.toLowerCase() || "";

      const description =
        restaurant.description?.toLowerCase() || "";

      /*
       * SEARCH MATCH
       */
      const matchesSearch =
        !search ||
        name.includes(search) ||
        location.includes(search) ||
        cuisine.includes(search) ||
        description.includes(search);

      /*
       * CUISINE MATCH
       */
      const matchesCuisine =
        !selectedCuisine ||
        restaurant.cuisine === selectedCuisine;

      /*
       * LOCATION MATCH
       */
      const matchesLocation =
        !selectedLocation ||
        restaurant.location === selectedLocation;

      /*
       * RATING MATCH
       */
      const matchesRating =
        !selectedRating ||
        Number(restaurant.rating || 0) >=
          Number(selectedRating);

      return (
        matchesSearch &&
        matchesCuisine &&
        matchesLocation &&
        matchesRating
      );
    });
  }, [
    restaurants,
    searchTerm,
    selectedCuisine,
    selectedRating,
    selectedLocation,
  ]);

  /*
   * MOST POPULAR
   */
  const popularRestaurants = [...restaurants]
    .sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    )
    .slice(0, 4);

  /*
   * NEARBY
   *
   * Currently using the restaurant list.
   * Later we can connect browser GPS
   * and calculate real distance.
   */
  const nearbyRestaurants = restaurants.slice(0, 4);

  /*
   * RECOMMENDED
   *
   * Temporary recommendation logic.
   * Later this will become the real AI
   * recommendation system.
   */
  const recommendedRestaurants = restaurants
    .filter(
      (restaurant) =>
        Number(restaurant.rating || 0) >= 4.0
    )
    .slice(0, 4);

  /*
   * RESTAURANT CLICK
   */
  const handleRestaurantClick = (id) => {
    navigate(`/restaurant/${id}`);
  };

  /*
   * SEARCH
   */
  const handleSearch = (event) => {
    event.preventDefault();

    const search = searchTerm.trim();

    if (
      search ||
      selectedCuisine ||
      selectedRating ||
      selectedLocation
    ) {
      document
        .getElementById("search-results")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }
  };

  /*
   * CLEAR FILTERS
   */
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("");
    setSelectedRating("");
    setSelectedLocation("");
  };

  /*
   * CHECK WHETHER ANY FILTER IS ACTIVE
   */
  const hasActiveFilters =
    searchTerm.trim() ||
    selectedCuisine ||
    selectedRating ||
    selectedLocation;

  return (
    <div className="dashboard">

      {/* ================= HERO ================= */}

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">

          <span className="dashboard-welcome">
            🍽️ Welcome to ZestHub
          </span>

          <h1>
            Discover your next
            <span> favorite restaurant.</span>
          </h1>

          <p>
            Find amazing food, explore restaurants around
            you, and discover places recommended just for you.
          </p>

          {/* SEARCH */}

          <form
            className="dashboard-search"
            onSubmit={handleSearch}
          >
            <span>🔎</span>

            <input
              type="text"
              placeholder="Search restaurants, cuisines or dishes..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <button type="submit">
              Search
            </button>
          </form>

        </div>
      </section>


      {/* ================= MAIN CONTAINER ================= */}

      <section className="dashboard-container">

        {/* ================= GREETING ================= */}

        <div className="user-greeting">

          <div>
            <span className="section-label">
              YOUR ZESTHUB
            </span>

            <h2>
              Hey {user?.name || "Foodie"} 👋
            </h2>

            <p>
              Let's find something delicious today.
            </p>
          </div>

          <button
            className="profile-button"
            onClick={() => navigate("/profile")}
          >
            👤 My Profile
          </button>

        </div>


        {/* ================= QUICK ACTIONS ================= */}

        <div className="quick-actions">

          <div className="quick-card">
            <div className="quick-icon">📍</div>

            <div>
              <h3>Nearby</h3>
              <p>Restaurants around you</p>
            </div>
          </div>


          <div className="quick-card">
            <div className="quick-icon">🔥</div>

            <div>
              <h3>Popular</h3>
              <p>Top restaurants in your city</p>
            </div>
          </div>


          <div className="quick-card">
            <div className="quick-icon">✨</div>

            <div>
              <h3>For You</h3>
              <p>Personalized recommendations</p>
            </div>
          </div>


          <div className="quick-card">
            <div className="quick-icon">❤️</div>

            <div>
              <h3>Favorites</h3>
              <p>Your saved restaurants</p>
            </div>
          </div>

        </div>


        {/* ================= FILTERS ================= */}

        <div className="restaurant-filters">

          {/* CUISINE */}

          <div className="filter-group">

            <label htmlFor="cuisine-filter">
              🍽️ Cuisine
            </label>

            <select
              id="cuisine-filter"
              value={selectedCuisine}
              onChange={(event) =>
                setSelectedCuisine(event.target.value)
              }
            >
              <option value="">
                All Cuisines
              </option>

              {cuisines.map((cuisine) => (
                <option
                  key={cuisine}
                  value={cuisine}
                >
                  {cuisine}
                </option>
              ))}
            </select>

          </div>


          {/* RATING */}

          <div className="filter-group">

            <label htmlFor="rating-filter">
              ⭐ Rating
            </label>

            <select
              id="rating-filter"
              value={selectedRating}
              onChange={(event) =>
                setSelectedRating(event.target.value)
              }
            >
              <option value="">
                Any Rating
              </option>

              <option value="4.5">
                ⭐ 4.5+
              </option>

              <option value="4.0">
                ⭐ 4.0+
              </option>

              <option value="3.5">
                ⭐ 3.5+
              </option>

              <option value="3.0">
                ⭐ 3.0+
              </option>
            </select>

          </div>


          {/* LOCATION */}

          <div className="filter-group">

            <label htmlFor="location-filter">
              📍 Location
            </label>

            <select
              id="location-filter"
              value={selectedLocation}
              onChange={(event) =>
                setSelectedLocation(event.target.value)
              }
            >
              <option value="">
                All Locations
              </option>

              {locations.map((location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              ))}
            </select>

          </div>


          {/* CLEAR */}

          <button
            type="button"
            className="clear-filters-button"
            onClick={handleClearFilters}
          >
            ↻ Clear Filters
          </button>

        </div>


        {/* ================= SEARCH / FILTER RESULTS ================= */}

        {hasActiveFilters && (

          <section
            className="restaurant-section"
            id="search-results"
          >

            <div className="section-header">

              <div>

                <span className="section-label">
                  SEARCH & FILTERS
                </span>

                <h2>
                  🔎 Restaurant Results
                </h2>

                <p>
                  {filteredRestaurants.length} restaurant
                  {filteredRestaurants.length !== 1
                    ? "s"
                    : ""}{" "}
                  found.
                </p>

              </div>

            </div>


            {/* ACTIVE FILTERS */}

            <div className="active-filters">

              {searchTerm.trim() && (
                <span className="active-filter">
                  🔎 {searchTerm}
                </span>
              )}

              {selectedCuisine && (
                <span className="active-filter">
                  🍽️ {selectedCuisine}
                </span>
              )}

              {selectedRating && (
                <span className="active-filter">
                  ⭐ {selectedRating}+
                </span>
              )}

              {selectedLocation && (
                <span className="active-filter">
                  📍 {selectedLocation}
                </span>
              )}

            </div>


            {filteredRestaurants.length === 0 ? (

              <div className="empty-message">

                <div className="empty-icon">
                  🔍
                </div>

                <strong>
                  No restaurants found
                </strong>

                <p>
                  Try changing your search or filters.
                </p>

                <button
                  className="empty-clear-button"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              <div className="restaurant-grid">

                {filteredRestaurants.map(
                  (restaurant) => (

                    <div
                      className="dashboard-restaurant-card"
                      key={restaurant.id}
                      onClick={() =>
                        handleRestaurantClick(
                          restaurant.id
                        )
                      }
                    >

                      <div className="restaurant-image-wrapper">

                        <img
                          src={getRestaurantImage(
                            restaurant.image
                          )}
                          alt={restaurant.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              heroFood;
                          }}
                        />

                        <span className="rating-badge">
                          ⭐ {getRating(restaurant)}
                        </span>

                      </div>

                      <div className="dashboard-card-content">

                        <h3>
                          {restaurant.name}
                        </h3>

                        <p className="restaurant-cuisine">
                          {restaurant.cuisine ||
                            "Restaurant"}
                        </p>

                        <p className="restaurant-location">
                          📍{" "}
                          {restaurant.location ||
                            "Trichy"}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}


        {/* ================= NEARBY ================= */}

        {!hasActiveFilters && (

          <section className="restaurant-section">

            <div className="section-header">

              <div>

                <span className="section-label">
                  DISCOVER
                </span>

                <h2>
                  📍 Restaurants Around You
                </h2>

                <p>
                  Explore restaurants available on ZestHub.
                </p>

              </div>

              <button
                onClick={() =>
                  navigate("/restaurants")
                }
              >
                View All →
              </button>

            </div>


            {loading ? (

              <div className="loading-message">
                Loading restaurants...
              </div>

            ) : nearbyRestaurants.length === 0 ? (

              <div className="empty-message">
                No restaurants available yet.
              </div>

            ) : (

              <div className="restaurant-grid">

                {nearbyRestaurants.map(
                  (restaurant) => (

                    <div
                      className="dashboard-restaurant-card"
                      key={restaurant.id}
                      onClick={() =>
                        handleRestaurantClick(
                          restaurant.id
                        )
                      }
                    >

                      <div className="restaurant-image-wrapper">

                        <img
                          src={getRestaurantImage(
                            restaurant.image
                          )}
                          alt={restaurant.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              heroFood;
                          }}
                        />

                        <span className="rating-badge">
                          ⭐ {getRating(restaurant)}
                        </span>

                      </div>

                      <div className="dashboard-card-content">

                        <h3>
                          {restaurant.name}
                        </h3>

                        <p className="restaurant-cuisine">
                          {restaurant.cuisine ||
                            "Restaurant"}
                        </p>

                        <p className="restaurant-location">
                          📍{" "}
                          {restaurant.location ||
                            "Trichy"}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}


        {/* ================= POPULAR ================= */}

        {!hasActiveFilters && (

          <section className="restaurant-section">

            <div className="section-header">

              <div>

                <span className="section-label">
                  TRENDING NOW
                </span>

                <h2>
                  🔥 Most Popular
                </h2>

                <p>
                  Highly rated restaurants loved by foodies.
                </p>

              </div>

            </div>


            <div className="restaurant-grid">

              {popularRestaurants.map(
                (restaurant) => (

                  <div
                    className="dashboard-restaurant-card"
                    key={restaurant.id}
                    onClick={() =>
                      handleRestaurantClick(
                        restaurant.id
                      )
                    }
                  >

                    <div className="restaurant-image-wrapper">

                      <img
                        src={getRestaurantImage(
                          restaurant.image
                        )}
                        alt={restaurant.name}
                        onError={(event) => {
                          event.currentTarget.src =
                            heroFood;
                        }}
                      />

                      <span className="rating-badge">
                        ⭐ {getRating(restaurant)}
                      </span>

                    </div>

                    <div className="dashboard-card-content">

                      <h3>
                        {restaurant.name}
                      </h3>

                      <p className="restaurant-cuisine">
                        {restaurant.cuisine ||
                          "Restaurant"}
                      </p>

                      <p className="restaurant-location">
                        📍{" "}
                        {restaurant.location ||
                          "Trichy"}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* ================= RECOMMENDED ================= */}

        {!hasActiveFilters && (

          <section className="recommended-section">

            <div className="recommended-content">

              <span className="section-label">
                ZESTHUB SMART
              </span>

              <h2>
                ✨ Recommended For You
              </h2>

              <p>
                ZestHub will learn your preferences,
                ratings, favorite cuisines and activity
                to provide personalized restaurant
                recommendations.
              </p>

              <button
                onClick={() =>
                  navigate("/restaurants")
                }
              >
                Explore Restaurants →
              </button>

            </div>

            <div className="recommended-icon">
              🤖
            </div>

          </section>

        )}


        {/* ================= COMMUNITY ================= */}

        {!hasActiveFilters && (

          <section className="community-section">

            <div>

              <span className="section-label">
                ZESTHUB COMMUNITY
              </span>

              <h2>
                👥 Share. Review. Discover.
              </h2>

              <p>
                See what other food lovers are saying,
                share your restaurant experiences and
                help the community discover great places.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/restaurants")
              }
            >
              Explore Community →
            </button>

          </section>

        )}

      </section>

    </div>
  );
}

export default Dashboard;