import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

import biryaniImage from "../../assets/images/biryani.jpg";
import burgerImage from "../../assets/images/burger.jpg";
import cafeImage from "../../assets/images/cafe.jpg";
import dessertsImage from "../../assets/images/desserts.jpg";
import heroFoodImage from "../../assets/images/hero-food.jpg";
import keralaFoodImage from "../../assets/images/Kerala Food Court.jpg";
import pizzaImage from "../../assets/images/pizza.jpg";
import restaurant1Image from "../../assets/images/restaurant1.jpg";
import restaurant2Image from "../../assets/images/restaurant2.jpg";
import restaurant3Image from "../../assets/images/restaurant3.jpg";

const imageMap = {
  "biryani.jpg": biryaniImage,
  "burger.jpg": burgerImage,
  "cafe.jpg": cafeImage,
  "desserts.jpg": dessertsImage,
  "hero-food.jpg": heroFoodImage,
  "Kerala Food Court.jpg": keralaFoodImage,
  "pizza.jpg": pizzaImage,
  "restaurant1.jpg": restaurant1Image,
  "restaurant2.jpg": restaurant2Image,
  "restaurant3.jpg": restaurant3Image,

  "barbeque-nation.jpg": restaurant1Image,
  "barbeque nation.jpg": restaurant1Image,

  "burger-king.jpg": burgerImage,
  "burger king.jpg": burgerImage,

  "chinese-wok.jpg": restaurant2Image,
  "chinese wok.jpg": restaurant2Image,

  "dominos.jpg": pizzaImage,
  "domino's.jpg": pizzaImage,

  "hotel-aruvi.jpg": restaurant3Image,
  "hotel aruvi.jpg": restaurant3Image,

  "kerala-food-court.jpg": keralaFoodImage,
  "kerala food court.jpg": keralaFoodImage,

  "pizza-hut.jpg": pizzaImage,
  "pizza hut.jpg": pizzaImage,

  "restaurant.jpg": restaurant1Image,
};

const normalizeImageName = (value) => {
  if (!value) return "";

  return value
    .split("/")
    .pop()
    .trim()
    .toLowerCase();
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [minimumRating, setMinimumRating] = useState(0);

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("zesthub_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ==========================================
  // FETCH RESTAURANTS
  // ==========================================

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("zesthub_token");

        const response = await fetch(
          `${API_URL}/api/restaurants`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        const data = await response.json();

        // Backend returns { value: [...], Count: ... }
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (Array.isArray(data.value)) {
          setRestaurants(data.value);
        } else {
          setRestaurants([]);
        }
      } catch (error) {
        console.error("Restaurant fetch error:", error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // ==========================================
  // CUISINES
  // ==========================================

  const cuisines = useMemo(() => {
    const values = restaurants
      .map((restaurant) => restaurant.cuisine)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [restaurants]);

  // ==========================================
  // LOCATIONS
  // ==========================================

  const locations = useMemo(() => {
    const values = restaurants
      .map((restaurant) => restaurant.location)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [restaurants]);

  // ==========================================
  // FILTER RESTAURANTS
  // ==========================================

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const name =
        restaurant.name?.toLowerCase() || "";

      const location =
        restaurant.location?.toLowerCase() || "";

      const cuisine =
        restaurant.cuisine?.toLowerCase() || "";

      const description =
        restaurant.description?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        location.includes(query) ||
        cuisine.includes(query) ||
        description.includes(query);

      const matchesCuisine =
        selectedCuisine === "All" ||
        restaurant.cuisine === selectedCuisine;

      const matchesLocation =
        selectedLocation === "All" ||
        restaurant.location === selectedLocation;

      const restaurantRating = Number(
        restaurant.rating ??
          restaurant.average_rating ??
          0
      );

      const matchesRating =
        restaurantRating >= minimumRating;

      return (
        matchesSearch &&
        matchesCuisine &&
        matchesLocation &&
        matchesRating
      );
    });
  }, [
    restaurants,
    search,
    selectedCuisine,
    selectedLocation,
    minimumRating,
  ]);

  // ==========================================
  // NEARBY RESTAURANTS
  // ==========================================

  const nearbyRestaurants = useMemo(() => {
    return filteredRestaurants.slice(0, 5);
  }, [filteredRestaurants]);

  // ==========================================
  // POPULAR RESTAURANTS
  // ==========================================

  const popularRestaurants = useMemo(() => {
    return [...filteredRestaurants]
      .sort((a, b) => {
        const ratingA = Number(
          a.rating ?? a.average_rating ?? 0
        );

        const ratingB = Number(
          b.rating ?? b.average_rating ?? 0
        );

        return ratingB - ratingA;
      })
      .slice(0, 5);
  }, [filteredRestaurants]);

  // ==========================================
  // IMAGE
  // ==========================================

  const getRestaurantImage = (restaurant) => {
    if (!restaurant?.image) {
      return restaurant1Image;
    }

    const imageValue = String(
      restaurant.image
    ).trim();

    const normalizedName =
      normalizeImageName(imageValue);

    if (imageMap[normalizedName]) {
      return imageMap[normalizedName];
    }

    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://")
    ) {
      return imageValue;
    }

    if (imageValue.startsWith("/uploads/")) {
      return `${API_URL}${imageValue}`;
    }

    if (imageValue.startsWith("uploads/")) {
      return `${API_URL}/${imageValue}`;
    }

    return `${API_URL}/uploads/${imageValue}`;
  };

  // ==========================================
  // IMAGE FALLBACK
  // ==========================================

  const handleImageError = (event) => {
    if (event.currentTarget.dataset.fallback === "true") {
      return;
    }

    event.currentTarget.dataset.fallback = "true";
    event.currentTarget.src = restaurant1Image;
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCuisine("All");
    setSelectedLocation("All");
    setMinimumRating(0);
  };

  const hasFilters =
    search ||
    selectedCuisine !== "All" ||
    selectedLocation !== "All" ||
    minimumRating > 0;

  // ==========================================
  // RESTAURANT CARD
  // ==========================================

  const RestaurantCard = ({ restaurant }) => {
    const restaurantRating = Number(
      restaurant.rating ??
        restaurant.average_rating ??
        0
    );

    return (
      <div
        className="dashboard-restaurant-card"
        onClick={() =>
          navigate(`/restaurant/${restaurant.id}`)
        }
      >
        <div className="dashboard-restaurant-image-wrapper">

          <img
            src={getRestaurantImage(restaurant)}
            alt={restaurant.name}
            className="dashboard-restaurant-image"
            onError={handleImageError}
          />

          <span className="dashboard-rating">
            ⭐ {restaurantRating.toFixed(1)}
          </span>

        </div>

        <div className="dashboard-restaurant-content">

          <h3>{restaurant.name}</h3>

          <p className="dashboard-cuisine">
            🍴 {restaurant.cuisine || "Various"}
          </p>

          <p className="dashboard-location">
            📍 {restaurant.location}
          </p>

          <button
            className="view-restaurant-button"
            onClick={(event) => {
              event.stopPropagation();

              navigate(
                `/restaurant/${restaurant.id}`
              );
            }}
          >
            View Restaurant →
          </button>

        </div>
      </div>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">
          <div className="dashboard-loading-icon">
            🍽️
          </div>

          <h2>Loading your ZestHub...</h2>

          <p>
            Finding delicious restaurants for you.
          </p>
        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-welcome-label">
            Welcome back 👋
          </span>

          <h1>
            {user?.name
              ? `Hello, ${user.name}!`
              : "Welcome to ZestHub!"}
          </h1>

          <p>
            Discover amazing food and restaurants
            around you.
          </p>

        </div>

        <button
          className="dashboard-profile-button"
          onClick={() => navigate("/profile")}
        >
          👤 Profile
        </button>

      </div>

      {/* ======================================
          QUICK ACTIONS
      ====================================== */}

      <div className="dashboard-feature-grid">

        {/* FAVORITES - CLICKABLE */}

        <div
          className="dashboard-feature-card clickable"
          onClick={() => navigate("/profile")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              navigate("/profile");
            }
          }}
        >

          <div className="feature-icon">
            ❤️
          </div>

          <h3>
            Favorites
          </h3>

          <p>
            Your saved restaurants
          </p>

          <span className="feature-arrow">
            View Favorites →
          </span>

        </div>

        {/* COMMUNITY */}

        <div
          className="dashboard-feature-card clickable"
          onClick={() =>
            document
              .getElementById("community-section")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >

          <div className="feature-icon">
            👥
          </div>

          <h3>
            Community
          </h3>

          <p>
            See what food lovers are saying
          </p>

          <span className="feature-arrow">
            Explore Community →
          </span>

        </div>

        {/* POPULAR */}

        <div
          className="dashboard-feature-card clickable"
          onClick={() =>
            document
              .getElementById("popular-section")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >

          <div className="feature-icon">
            🔥
          </div>

          <h3>
            Popular
          </h3>

          <p>
            Most famous restaurants
          </p>

          <span className="feature-arrow">
            Explore Popular →
          </span>

        </div>

      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <section className="dashboard-search-section">

        <div className="dashboard-section-title">

          <div>
            <span className="section-label">
              🔎 Discover
            </span>

            <h2>
              Find Your Perfect Restaurant
            </h2>

            <p>
              Search by restaurant, cuisine or location.
            </p>
          </div>

        </div>

        <div className="dashboard-search-box">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search restaurants, cuisine, location..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="clear-search"
            >
              ✕
            </button>
          )}

        </div>

      </section>

      {/* ======================================
          FILTERS
      ====================================== */}

      <section className="dashboard-filter-section">

        <div className="filter-group">

          <label>
            Cuisine
          </label>

          <select
            value={selectedCuisine}
            onChange={(event) =>
              setSelectedCuisine(event.target.value)
            }
          >
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

        <div className="filter-group">

          <label>
            Location
          </label>

          <select
            value={selectedLocation}
            onChange={(event) =>
              setSelectedLocation(event.target.value)
            }
          >
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

        <div className="filter-group">

          <label>
            Minimum Rating
          </label>

          <select
            value={minimumRating}
            onChange={(event) =>
              setMinimumRating(
                Number(event.target.value)
              )
            }
          >
            <option value="0">
              All Ratings
            </option>

            <option value="3">
              ⭐ 3+
            </option>

            <option value="4">
              ⭐ 4+
            </option>

            <option value="4.5">
              ⭐ 4.5+
            </option>
          </select>

        </div>

        {hasFilters && (
          <button
            className="clear-filters-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}

      </section>

      {/* ======================================
          FILTER RESULT
      ====================================== */}

      <div className="filter-result-info">

        <strong>
          {filteredRestaurants.length}
        </strong>

        <span>
          restaurants found
        </span>

      </div>

      {/* ======================================
          NEARBY
      ====================================== */}

      <section className="dashboard-restaurant-section">

        <div className="dashboard-section-heading">

          <div>

            <span className="section-label">
              📍 Nearby
            </span>

            <h2>
              Restaurants Around You
            </h2>

            <p>
              Discover restaurants available in your area.
            </p>

          </div>

          <button
            className="see-all-button"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            See All →
          </button>

        </div>

        {nearbyRestaurants.length === 0 ? (

          <div className="empty-dashboard-state">

            <div>
              🔍
            </div>

            <h3>
              No restaurants found
            </h3>

            <p>
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="dashboard-restaurant-grid">

            {nearbyRestaurants.map(
              (restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              )
            )}

          </div>

        )}

      </section>

      {/* ======================================
          POPULAR
      ====================================== */}

      <section
        className="dashboard-restaurant-section"
        id="popular-section"
      >

        <div className="dashboard-section-heading">

          <div>

            <span className="section-label">
              🔥 Trending
            </span>

            <h2>
              Most Popular in Your City
            </h2>

            <p>
              Restaurants with the highest ratings.
            </p>

          </div>

        </div>

        <div className="dashboard-restaurant-grid">

          {popularRestaurants.length === 0 ? (

            <div className="empty-dashboard-state">

              <div>
                🍽️
              </div>

              <h3>
                No popular restaurants yet
              </h3>

            </div>

          ) : (

            popularRestaurants.map(
              (restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              )
            )

          )}

        </div>

      </section>

      {/* ======================================
          RECOMMENDED
      ====================================== */}

      <section className="recommended-section">

        <div className="recommended-content">

          <div className="recommended-icon">
            ✨
          </div>

          <div>

            <span className="section-label">
              ✨ Smart ZestHub
            </span>

            <h2>
              Recommended For You
            </h2>

            <p>
              Personalized restaurant recommendations
              based on your preferences, ratings and activity
              will appear here.
            </p>

          </div>

        </div>

        <span className="coming-soon-badge">
          Coming Soon
        </span>

      </section>

      {/* ======================================
          COMMUNITY
      ====================================== */}

      <section
        className="community-dashboard-section"
        id="community-section"
      >

        <div className="dashboard-section-heading">

          <div>

            <span className="section-label">
              👥 ZestHub Community
            </span>

            <h2>
              Food Lovers Community
            </h2>

            <p>
              Share experiences, ratings and reviews.
            </p>

          </div>

        </div>

        <div className="community-dashboard-card">

          <div className="community-big-icon">
            💬
          </div>

          <div>

            <h3>
              Your voice matters!
            </h3>

            <p>
              Rate restaurants and write reviews to
              help other ZestHub users discover great food.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/restaurants")
            }
          >
            Explore Restaurants
          </button>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;