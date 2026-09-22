import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Favorites.css";

// ==========================================
// LOCAL RESTAURANT IMAGES
// ==========================================

import biryaniImage from "../../../assets/images/biryani.jpg";
import burgerImage from "../../../assets/images/burger.jpg";
import cafeImage from "../../../assets/images/cafe.jpg";
import dessertsImage from "../../../assets/images/desserts.jpg";
import heroFoodImage from "../../../assets/images/hero-food.jpg";
import keralaFoodImage from "../../../assets/images/Kerala Food Court.jpg";
import pizzaImage from "../../../assets/images/pizza.jpg";
import restaurant1Image from "../../../assets/images/restaurant1.jpg";
import restaurant2Image from "../../../assets/images/restaurant2.jpg";
import restaurant3Image from "../../../assets/images/restaurant3.jpg";

const API_URL = "http://127.0.0.1:8000";

// ==========================================
// IMAGE MAP
// ==========================================

const imageMap = {
  "biryani.jpg": biryaniImage,
  "burger.jpg": burgerImage,
  "cafe.jpg": cafeImage,
  "desserts.jpg": dessertsImage,
  "hero-food.jpg": heroFoodImage,
  "kerala food court.jpg": keralaFoodImage,
  "pizza.jpg": pizzaImage,
  "restaurant1.jpg": restaurant1Image,
  "restaurant2.jpg": restaurant2Image,
  "restaurant3.jpg": restaurant3Image,

  // Barbeque Nation
  "barbeque-nation.jpg": restaurant1Image,
  "barbeque nation.jpg": restaurant1Image,

  // Burger King
  "burger-king.jpg": burgerImage,
  "burger king.jpg": burgerImage,

  // Chinese Wok
  "chinese-wok.jpg": restaurant2Image,
  "chinese wok.jpg": restaurant2Image,

  // Domino's
  "dominos.jpg": pizzaImage,
  "domino's.jpg": pizzaImage,

  // Hotel Aruvi
  "hotel-aruvi.jpg": restaurant3Image,
  "hotel aruvi.jpg": restaurant3Image,

  // Kerala Food Court
  "kerala-food-court.jpg": keralaFoodImage,

  // Pizza Hut
  "pizza-hut.jpg": pizzaImage,
  "pizza hut.jpg": pizzaImage,

  // Generic restaurant
  "restaurant.jpg": restaurant1Image,
};

// ==========================================
// NORMALIZE IMAGE NAME
// ==========================================

const normalizeImageName = (value) => {
  if (!value) {
    return "";
  }

  return value
    .split("/")
    .pop()
    .trim()
    .toLowerCase();
};

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD FAVORITES
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("zesthub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const loadFavorites = async () => {
      try {
        setError("");

        const response = await axios.get(
          `${API_URL}/api/favorites/my-favorites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setFavorites(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("zesthub_token");
          localStorage.removeItem("zesthub_user");

          if (!cancelled) {
            navigate("/login");
          }

          return;
        }

        if (!cancelled) {
          setError(
            "Unable to load your favorite restaurants."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ==========================================
  // RETRY FAVORITES
  // ==========================================

  const handleRetry = async () => {
    const token = localStorage.getItem(
      "zesthub_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/favorites/my-favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFavorites(response.data);
    } catch (error) {
      console.error(
        "Failed to reload favorites:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("zesthub_token");
        localStorage.removeItem("zesthub_user");
        navigate("/login");
        return;
      }

      setError(
        "Unable to load your favorite restaurants."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REMOVE FAVORITE
  // ==========================================

  const handleRemoveFavorite = async (
    restaurantId
  ) => {
    const token = localStorage.getItem(
      "zesthub_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/favorites/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (restaurant) =>
            restaurant.id !== restaurantId
        )
      );
    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("zesthub_token");
        localStorage.removeItem("zesthub_user");

        navigate("/login");
        return;
      }

      alert(
        "Unable to remove this favorite restaurant."
      );
    }
  };

  // ==========================================
  // GET RESTAURANT IMAGE
  // ==========================================

  const getRestaurantImage = (image) => {
    if (!image) {
      return restaurant1Image;
    }

    const imageValue = String(image).trim();

    const normalizedName =
      normalizeImageName(imageValue);

    // Local frontend image
    if (imageMap[normalizedName]) {
      return imageMap[normalizedName];
    }

    // External image
    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://")
    ) {
      return imageValue;
    }

    // Backend upload
    if (imageValue.startsWith("/uploads/")) {
      return `${API_URL}${imageValue}`;
    }

    if (imageValue.startsWith("uploads/")) {
      return `${API_URL}/${imageValue}`;
    }

    return restaurant1Image;
  };

  // ==========================================
  // IMAGE ERROR FALLBACK
  // ==========================================

  const handleImageError = (event) => {
    if (
      event.currentTarget.dataset.fallback ===
      "true"
    ) {
      return;
    }

    event.currentTarget.dataset.fallback =
      "true";

    event.currentTarget.src =
      restaurant1Image;
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="favorites-page">
        <section className="favorites-header">
          <div className="favorites-header-content">
            <span className="favorites-label">
              YOUR COLLECTION
            </span>

            <h1>
              ❤️ My Favorites
            </h1>

            <p>
              Your saved restaurants
              in one place.
            </p>
          </div>
        </section>

        <div className="favorites-loading">
          <div className="favorites-loading-icon">
            ❤️
          </div>

          <h2>
            Loading your favorites...
          </h2>

          <p>
            We're getting your saved
            restaurants.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <div className="favorites-page">
        <section className="favorites-header">
          <div className="favorites-header-content">
            <span className="favorites-label">
              YOUR COLLECTION
            </span>

            <h1>
              ❤️ My Favorites
            </h1>

            <p>
              Your saved restaurants
              in one place.
            </p>
          </div>
        </section>

        <div className="favorites-error">
          <div className="favorites-error-icon">
            ⚠️
          </div>

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="favorites-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <section className="favorites-header">
        <div className="favorites-header-content">
          <span className="favorites-label">
            YOUR COLLECTION
          </span>

          <h1>
            ❤️ My Favorites
          </h1>

          <p>
            Restaurants you have saved
            on ZestHub.
          </p>
        </div>
      </section>

      {/* =====================================
          CONTENT
      ====================================== */}

      <section className="favorites-container">

        {/* ===================================
            SUMMARY
        ==================================== */}

        <div className="favorites-summary">

          <div className="favorites-summary-icon">
            ❤️
          </div>

          <div>
            <span>
              SAVED RESTAURANTS
            </span>

            <h2>
              {favorites.length}
            </h2>
          </div>

          <div className="favorites-summary-text">
            {favorites.length === 0
              ? "You haven't saved any restaurants yet."
              : favorites.length === 1
              ? "1 restaurant saved to your collection."
              : `${favorites.length} restaurants saved to your collection.`}
          </div>

        </div>

        {/* ===================================
            EMPTY STATE
        ==================================== */}

        {favorites.length === 0 && (
          <div className="favorites-empty">

            <div className="favorites-empty-icon">
              ❤️
            </div>

            <h2>
              No Favorite Restaurants Yet
            </h2>

            <p>
              Start exploring restaurants
              and save the ones you love.
            </p>

            <button
              onClick={() =>
                navigate("/restaurants")
              }
            >
              Explore Restaurants
            </button>

          </div>
        )}

        {/* ===================================
            FAVORITE RESTAURANTS
        ==================================== */}

        {favorites.length > 0 && (
          <div className="favorites-grid">

            {favorites.map((restaurant) => (
              <article
                className="favorites-card"
                key={restaurant.id}
              >

                {/* IMAGE */}

                <div className="favorites-image-wrapper">

                  <img
                    src={getRestaurantImage(
                      restaurant.image
                    )}
                    alt={restaurant.name}
                    className="favorites-image"
                    onError={handleImageError}
                  />

                  <span className="favorites-heart">
                    ❤️
                  </span>

                </div>

                {/* CARD CONTENT */}

                <div className="favorites-card-content">

                  <h3>
                    {restaurant.name}
                  </h3>

                  <p className="favorites-location">
                    📍{" "}
                    {restaurant.location}
                  </p>

                  <p className="favorites-cuisine">
                    🍽️{" "}
                    {restaurant.cuisine}
                  </p>

                  <div className="favorites-rating">
                    ⭐{" "}
                    {restaurant.rating
                      ? Number(
                          restaurant.rating
                        ).toFixed(1)
                      : "New"}
                  </div>

                  <p className="favorites-description">
                    {restaurant.description ||
                      "Discover delicious food and great experiences at this restaurant."}
                  </p>

                  {/* ACTION BUTTONS */}

                  <div className="favorites-actions">

                    <button
                      className="favorites-view-button"
                      onClick={() =>
                        navigate(
                          `/restaurant/${restaurant.id}`
                        )
                      }
                    >
                      View Restaurant
                    </button>

                    <button
                      className="favorites-remove-button"
                      onClick={() =>
                        handleRemoveFavorite(
                          restaurant.id
                        )
                      }
                    >
                      Remove ❤️
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

        {/* ===================================
            BOTTOM ACTIONS
        ==================================== */}

        <div className="favorites-bottom-actions">

          <button
            className="favorites-back-button"
            onClick={() =>
              navigate("/profile")
            }
          >
            ← Back to Profile
          </button>

          <button
            className="favorites-explore-button"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            Explore More Restaurants
          </button>

        </div>

      </section>

    </div>
  );
}

export default Favorites;