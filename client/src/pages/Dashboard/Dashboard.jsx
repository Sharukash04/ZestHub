import API_URL from "../../config";
import "./Dashboard.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowRight,
  FaCompass,
  FaComments,
  FaFire,
  FaHeart,
  FaMapMarkerAlt,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaUtensils,
  FaUser,
  FaUsers,
} from "react-icons/fa";

import {
  getRestaurantImage,
  FALLBACK_RESTAURANT_IMAGE,
} from "../../utils/restaurantImage";

function Dashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [restaurants, setRestaurants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [cuisine, setCuisine] =
    useState("All");

  const [location, setLocation] =
    useState("All");

  const [minimumRating, setMinimumRating] =
    useState("All");

  const [user, setUser] =
    useState(null);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "zesthub_user"
        );

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Unable to load user:",
        error
      );
    }
  }, []);

  // =====================================================
  // FETCH RESTAURANTS
  // =====================================================

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/restaurants/`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch restaurants"
          );
        }

        const data =
          await response.json();

        setRestaurants(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard restaurant error:",
          error
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

  // =====================================================
  // CUISINE OPTIONS
  // =====================================================

  const cuisineOptions = useMemo(() => {
    const values = restaurants
      .map(
        (restaurant) =>
          restaurant.cuisine
      )
      .filter(Boolean)
      .map((value) =>
        String(value).trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [restaurants]);

  // =====================================================
  // LOCATION OPTIONS
  // =====================================================

  const locationOptions = useMemo(() => {
    const values = restaurants
      .map(
        (restaurant) =>
          restaurant.location
      )
      .filter(Boolean)
      .map((value) =>
        String(value).trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [restaurants]);

  // =====================================================
  // FILTER RESTAURANTS
  // =====================================================

  const filteredRestaurants =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return restaurants.filter(
        (restaurant) => {
          const name =
            String(
              restaurant.name || ""
            ).toLowerCase();

          const restaurantCuisine =
            String(
              restaurant.cuisine || ""
            ).toLowerCase();

          const restaurantLocation =
            String(
              restaurant.location || ""
            ).toLowerCase();

          const matchesSearch =
            !searchText ||
            name.includes(
              searchText
            ) ||
            restaurantCuisine.includes(
              searchText
            ) ||
            restaurantLocation.includes(
              searchText
            );

          const matchesCuisine =
            cuisine === "All" ||
            restaurant.cuisine ===
              cuisine;

          const matchesLocation =
            location === "All" ||
            restaurant.location ===
              location;

          const rating = Number(
            restaurant.average_rating ??
              restaurant.rating ??
              0
          );

          let matchesRating = true;

          if (
            minimumRating === "3"
          ) {
            matchesRating =
              rating >= 3;
          }

          if (
            minimumRating === "4"
          ) {
            matchesRating =
              rating >= 4;
          }

          if (
            minimumRating === "4.5"
          ) {
            matchesRating =
              rating >= 4.5;
          }

          return (
            matchesSearch &&
            matchesCuisine &&
            matchesLocation &&
            matchesRating
          );
        }
      );
    }, [
      restaurants,
      search,
      cuisine,
      location,
      minimumRating,
    ]);

  // =====================================================
  // NEARBY
  // =====================================================

  const nearbyRestaurants =
    filteredRestaurants.slice(
      0,
      5
    );

  // =====================================================
  // TRENDING
  // =====================================================

  const trendingRestaurants =
    [...restaurants]
      .sort((a, b) => {
        const ratingA =
          Number(
            a.average_rating ??
              a.rating ??
              0
          );

        const ratingB =
          Number(
            b.average_rating ??
              b.rating ??
              0
          );

        return ratingB - ratingA;
      })
      .slice(0, 5);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "zesthub_token"
    );

    localStorage.removeItem(
      "zesthub_user"
    );

    navigate("/login");
  };

  // =====================================================
  // USER NAME
  // =====================================================

  const userName =
    user?.name ||
    user?.username ||
    user?.full_name ||
    "ZestHub User";

  // =====================================================
  // RESTAURANT CARD
  // =====================================================

  const RestaurantCard = ({
    restaurant,
  }) => {
    const rating =
      Number(
        restaurant.average_rating ??
          restaurant.rating ??
          0
      );

    const image =
      getRestaurantImage(
        restaurant.image
      );

    return (
      <div className="dashboard-restaurant-card">

        {/* IMAGE */}

        <div className="dashboard-card-image-wrapper">

          <img
            src={image}
            alt={
              restaurant.name ||
              "Restaurant"
            }
            className="dashboard-card-image"
            onError={(event) => {
              event.currentTarget.onerror =
                null;

              event.currentTarget.src =
                FALLBACK_RESTAURANT_IMAGE;
            }}
          />

          {/* RATING */}

          <div className="dashboard-rating">
            <FaStar />

            <span>
              {rating > 0
                ? rating.toFixed(1)
                : "New"}
            </span>
          </div>

        </div>

        {/* CONTENT */}

        <div className="dashboard-card-content">

          <h3>
            {restaurant.name}
          </h3>

          <div className="dashboard-card-info">

            <FaUtensils />

            <span>
              {restaurant.cuisine ||
                "Restaurant"}
            </span>

          </div>

          <div className="dashboard-card-info">

            <FaMapMarkerAlt />

            <span>
              {restaurant.location ||
                "Location unavailable"}
            </span>

          </div>

          <Link
            to={`/restaurant/${restaurant.id}`}
            className="dashboard-view-button"
          >
            View Restaurant

            <FaArrowRight />

          </Link>

        </div>

      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="dashboard-navbar">

        <Link
          to="/dashboard"
          className="dashboard-logo"
        >
          <FaUtensils />

          <span>
            ZestHub
          </span>

        </Link>

        <nav className="dashboard-nav-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/restaurants">
            Restaurants
          </Link>

          <Link to="/profile">
            Profile
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-logout"
          >
            <FaSignOutAlt />

            Logout

          </button>

        </nav>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-container">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <span className="dashboard-small-label">
              Welcome back!
            </span>

            <h1>
              Hello, {userName}!
            </h1>

            <p>
              Discover amazing food and
              restaurants around you.
            </p>

          </div>

          <Link
            to="/profile"
            className="dashboard-profile-button"
          >
            <FaUser />

            Profile

          </Link>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="dashboard-quick-grid">

          {/* FAVORITES */}

          <div className="dashboard-quick-card">

            <div className="dashboard-quick-icon">
              <FaHeart />
            </div>

            <h3>
              Favorites
            </h3>

            <p>
              Your saved restaurants
            </p>

            <Link to="/favorites">

              View Favorites

              <FaArrowRight />

            </Link>

          </div>

          {/* COMMUNITY */}

          <div className="dashboard-quick-card">

            <div className="dashboard-quick-icon">
              <FaUsers />
            </div>

            <h3>
              Community
            </h3>

            <p>
              See what food lovers
              are saying
            </p>

            <Link to="/reviews">

              Explore Community

              <FaArrowRight />

            </Link>

          </div>

          {/* POPULAR */}

          <div className="dashboard-quick-card">

            <div className="dashboard-quick-icon">
              <FaFire />
            </div>

            <h3>
              Popular
            </h3>

            <p>
              Most famous restaurants
            </p>

            <Link to="/restaurants">

              Explore Popular

              <FaArrowRight />

            </Link>

          </div>

        </section>

        {/* =================================================
            DISCOVER
        ================================================= */}

        <section className="dashboard-discover">

          <div className="dashboard-section-heading">

            <div>

              <span className="dashboard-small-label">

                <FaCompass />

                Discover

              </span>

              <h2>
                Find Your Perfect Restaurant
              </h2>

              <p>
                Search by restaurant,
                cuisine or location.
              </p>

            </div>

          </div>

          {/* SEARCH */}

          <div className="dashboard-search-box">

            <FaSearch />

            <input
              type="text"
              placeholder="Search restaurants, cuisine, location..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          {/* FILTERS */}

          <div className="dashboard-filters">

            {/* CUISINE */}

            <div className="dashboard-filter">

              <label>
                Cuisine
              </label>

              <select
                value={cuisine}
                onChange={(event) =>
                  setCuisine(
                    event.target.value
                  )
                }
              >

                {cuisineOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* LOCATION */}

            <div className="dashboard-filter">

              <label>
                Location
              </label>

              <select
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
              >

                {locationOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* RATING */}

            <div className="dashboard-filter">

              <label>
                Minimum Rating
              </label>

              <select
                value={minimumRating}
                onChange={(event) =>
                  setMinimumRating(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Ratings
                </option>

                <option value="3">
                  3+
                </option>

                <option value="4">
                  4+
                </option>

                <option value="4.5">
                  4.5+
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* =================================================
            NEARBY
        ================================================= */}

        <section className="dashboard-restaurant-section">

          <div className="dashboard-section-title">

            <div>

              <span className="dashboard-small-label">

                <FaMapMarkerAlt />

                Nearby

              </span>

              <h2>
                Restaurants Around You
              </h2>

              <p>
                Discover restaurants
                available in your area.
              </p>

            </div>

            <Link
              to="/restaurants"
              className="dashboard-see-all"
            >

              See All

              <FaArrowRight />

            </Link>

          </div>

          {loading ? (

            <div className="dashboard-message">
              Loading restaurants...
            </div>

          ) : error ? (

            <div className="dashboard-message">
              {error}
            </div>

          ) : nearbyRestaurants.length ===
            0 ? (

            <div className="dashboard-message">
              No restaurants found.
            </div>

          ) : (

            <div className="dashboard-restaurant-grid">

              {nearbyRestaurants.map(
                (restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={
                      restaurant
                    }
                  />
                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            TRENDING
        ================================================= */}

        <section className="dashboard-restaurant-section">

          <div className="dashboard-section-title">

            <div>

              <span className="dashboard-small-label">

                <FaFire />

                Trending

              </span>

              <h2>
                Most Popular in Your City
              </h2>

              <p>
                Restaurants with the
                highest ratings.
              </p>

            </div>

          </div>

          <div className="dashboard-restaurant-grid">

            {trendingRestaurants.map(
              (restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={
                    restaurant
                  }
                />
              )
            )}

          </div>

        </section>

        {/* =================================================
            SMART RECOMMENDATIONS
        ================================================= */}

        <section className="dashboard-smart-section">

          <div className="dashboard-smart-icon">
            <FaCompass />
          </div>

          <span className="dashboard-small-label">
            Smart ZestHub
          </span>

          <h2>
            Recommended For You
          </h2>

          <p>
            Personalized restaurant
            recommendations based on your
            preferences, ratings and
            activity will appear here.
          </p>

          <span className="dashboard-coming-soon">
            Coming Soon
          </span>

        </section>

        {/* =================================================
            COMMUNITY
        ================================================= */}

        <section className="dashboard-community">

          <div className="dashboard-community-icon">
            <FaComments />
          </div>

          <span className="dashboard-small-label">
            ZestHub Community
          </span>

          <h2>
            Food Lovers Community
          </h2>

          <p>
            Share experiences, ratings
            and reviews.
          </p>

          <div className="dashboard-community-box">

            <FaComments />

            <h3>
              Your voice matters!
            </h3>

            <p>
              Rate restaurants and write
              reviews to help other
              ZestHub users discover great
              food.
            </p>

            <Link to="/restaurants">

              Explore Restaurants

              <FaArrowRight />

            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;