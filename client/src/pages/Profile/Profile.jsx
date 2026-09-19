import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

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

const API_URL = "http://127.0.0.1:8000";

/* =========================================
   RESTAURANT IMAGE MAP
========================================= */

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

  "pizza-hut.jpg": pizzaImage,
  "pizza hut.jpg": pizzaImage,

  "restaurant.jpg": restaurant1Image,
};

/* =========================================
   NORMALIZE IMAGE NAME
========================================= */

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


function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [favoritesError, setFavoritesError] =
    useState("");


  /* =========================================
     LOAD PROFILE + FAVORITES
  ========================================== */

  useEffect(() => {
    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserProfile(token);
    fetchFavorites(token);
  }, [navigate]);


  /* =========================================
     FETCH USER
  ========================================== */

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);

      localStorage.setItem(
        "zesthub_user",
        JSON.stringify(response.data)
      );

    } catch (error) {

      console.error(
        "Failed to load profile:",
        error
      );

      if (error.response?.status === 401) {

        localStorage.removeItem(
          "zesthub_token"
        );

        localStorage.removeItem(
          "zesthub_user"
        );

        navigate("/login");
        return;
      }

      setError(
        "Unable to load your profile."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =========================================
     FETCH FAVORITES
  ========================================== */

  const fetchFavorites = async (token) => {
    try {

      setFavoritesLoading(true);
      setFavoritesError("");

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
        "Failed to load favorites:",
        error
      );

      if (error.response?.status === 401) {

        localStorage.removeItem(
          "zesthub_token"
        );

        localStorage.removeItem(
          "zesthub_user"
        );

        navigate("/login");
        return;
      }

      setFavoritesError(
        "Unable to load your favorite restaurants."
      );

    } finally {

      setFavoritesLoading(false);

    }
  };


  /* =========================================
     REMOVE FAVORITE
  ========================================== */

  const handleRemoveFavorite = async (
    restaurantId
  ) => {

    const token =
      localStorage.getItem("zesthub_token");

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

      setFavorites(
        (currentFavorites) =>
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

        localStorage.removeItem(
          "zesthub_token"
        );

        localStorage.removeItem(
          "zesthub_user"
        );

        navigate("/login");
        return;
      }

      alert(
        "Unable to remove this favorite."
      );
    }
  };


  /* =========================================
     GET RESTAURANT IMAGE
  ========================================== */

  const getRestaurantImage = (image) => {

    if (!image) {
      return restaurant1Image;
    }

    const imageValue =
      String(image).trim();

    const normalizedName =
      normalizeImageName(imageValue);

    /* LOCAL FRONTEND IMAGE */

    if (imageMap[normalizedName]) {
      return imageMap[normalizedName];
    }

    /* EXTERNAL IMAGE */

    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://")
    ) {
      return imageValue;
    }

    /* BACKEND UPLOAD */

    if (
      imageValue.startsWith("/uploads/")
    ) {
      return `${API_URL}${imageValue}`;
    }

    if (
      imageValue.startsWith("uploads/")
    ) {
      return `${API_URL}/${imageValue}`;
    }

    /* FINAL FALLBACK */

    return restaurant1Image;
  };


  /* =========================================
     IMAGE ERROR FALLBACK
  ========================================== */

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


  /* =========================================
     LOGOUT
  ========================================== */

  const handleLogout = () => {

    localStorage.removeItem(
      "zesthub_token"
    );

    localStorage.removeItem(
      "zesthub_user"
    );

    navigate("/login");
  };


  /* =========================================
     LOADING
  ========================================== */

  if (loading) {

    return (
      <div className="profile-page">

        <div className="profile-loading">
          Loading your profile...
        </div>

      </div>
    );
  }


  /* =========================================
     ERROR
  ========================================== */

  if (error) {

    return (
      <div className="profile-page">

        <div className="profile-error">

          {error}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }


  /* =========================================
     MAIN
  ========================================== */

  return (
    <div className="profile-page">

      {/* HEADER */}

      <section className="profile-header">

        <div className="profile-header-content">

          <span className="profile-label">
            ZESTHUB ACCOUNT
          </span>

          <h1>
            👤 My Profile
          </h1>

          <p>
            Manage your ZestHub account and
            discover your food journey.
          </p>

        </div>

      </section>


      {/* CONTENT */}

      <section className="profile-container">

        {/* USER CARD */}

        <div className="profile-card">

          <div className="profile-avatar">

            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}

          </div>


          <div className="profile-main-info">

            <span className="profile-small-label">
              WELCOME BACK
            </span>

            <h2>
              {user?.name || "Foodie"} 👋
            </h2>

            <p>
              {user?.email ||
                "No email available"}
            </p>

          </div>


          <div className="profile-role">
            {user?.role || "user"}
          </div>

        </div>


        {/* PERSONAL INFORMATION */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <div>

              <span className="profile-label">
                ACCOUNT
              </span>

              <h2>
                Personal Information
              </h2>

              <p>
                Your basic ZestHub account
                information.
              </p>

            </div>

          </div>


          <div className="profile-info-grid">

            <div className="profile-info-card">

              <span className="info-icon">
                👤
              </span>

              <div>

                <span className="info-label">
                  FULL NAME
                </span>

                <strong>
                  {user?.name ||
                    "Not available"}
                </strong>

              </div>

            </div>


            <div className="profile-info-card">

              <span className="info-icon">
                📧
              </span>

              <div>

                <span className="info-label">
                  EMAIL ADDRESS
                </span>

                <strong>
                  {user?.email ||
                    "Not available"}
                </strong>

              </div>

            </div>


            <div className="profile-info-card">

              <span className="info-icon">
                🛡️
              </span>

              <div>

                <span className="info-label">
                  ACCOUNT ROLE
                </span>

                <strong>
                  {user?.role || "user"}
                </strong>

              </div>

            </div>


            <div className="profile-info-card">

              <span className="info-icon">
                🍽️
              </span>

              <div>

                <span className="info-label">
                  ZESTHUB MEMBER
                </span>

                <strong>
                  Food Explorer
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* FOOD PREFERENCES */}

        <section className="profile-section">

          <div className="profile-feature-card">

            <div className="feature-icon">
              🍽️
            </div>

            <div className="feature-content">

              <span className="profile-label">
                COMING NEXT
              </span>

              <h2>
                Food Preferences
              </h2>

              <p>
                Tell ZestHub what you love to
                eat. Your preferences will later
                help us provide personalized
                restaurant recommendations.
              </p>

            </div>

            <div className="feature-status">
              Coming Soon
            </div>

          </div>

        </section>


        {/* FAVORITES */}

        <section
          className="profile-section favorites-section"
          id="my-favorites-section"
        >

          <div className="profile-section-heading">

            <span className="profile-label">
              YOUR COLLECTION
            </span>

            <h2>
              ❤️ My Favorites
            </h2>

            <p>
              Restaurants you have saved
              on ZestHub.
            </p>

          </div>


          {/* FAVORITES LOADING */}

          {favoritesLoading && (

            <div className="favorites-state">

              Loading your favorite
              restaurants...

            </div>

          )}


          {/* FAVORITES ERROR */}

          {!favoritesLoading &&
            favoritesError && (

              <div className="favorites-state favorites-error">

                <p>
                  {favoritesError}
                </p>

                <button
                  onClick={() =>
                    fetchFavorites(
                      localStorage.getItem(
                        "zesthub_token"
                      )
                    )
                  }
                >
                  Try Again
                </button>

              </div>

            )}


          {/* EMPTY */}

          {!favoritesLoading &&
            !favoritesError &&
            favorites.length === 0 && (

              <div className="favorites-empty">

                <div className="favorites-empty-icon">
                  ❤️
                </div>

                <h3>
                  No Favorite Restaurants Yet
                </h3>

                <p>
                  Start exploring restaurants
                  and save your favorites here.
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


          {/* FAVORITES GRID */}

          {!favoritesLoading &&
            !favoritesError &&
            favorites.length > 0 && (

              <div className="favorites-grid">

                {favorites.map(
                  (restaurant) => (

                    <article
                      className="favorite-restaurant-card"
                      key={restaurant.id}
                    >

                      <div className="favorite-image-wrapper">

                        <img
                          src={getRestaurantImage(
                            restaurant.image
                          )}
                          alt={restaurant.name}
                          className="favorite-restaurant-image"
                          onError={
                            handleImageError
                          }
                        />

                        <span className="favorite-heart">
                          ❤️
                        </span>

                      </div>


                      <div className="favorite-card-content">

                        <h3>
                          {restaurant.name}
                        </h3>

                        <p className="favorite-location">
                          📍{" "}
                          {restaurant.location}
                        </p>

                        <p className="favorite-cuisine">
                          🍽️{" "}
                          {restaurant.cuisine}
                        </p>

                        <div className="favorite-rating">

                          ⭐{" "}

                          {restaurant.rating
                            ? Number(
                                restaurant.rating
                              ).toFixed(1)
                            : "New"}

                        </div>

                        <p className="favorite-description">
                          {restaurant.description}
                        </p>


                        <div className="favorite-card-actions">

                          <button
                            className="favorite-view-button"
                            onClick={() =>
                              navigate(
                                `/restaurant/${restaurant.id}`
                              )
                            }
                          >
                            View Restaurant
                          </button>


                          <button
                            className="favorite-remove-button"
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

                  )
                )}

              </div>

            )}

        </section>


        {/* QUICK ACTIONS */}

        <div className="profile-actions">

          <button
            className="profile-action-card"
            onClick={() =>
              navigate("/profile/reviews")
            }
          >

            <span>
              ⭐
            </span>

            <div>

              <strong>
                My Reviews
              </strong>

              <p>
                Reviews you write on ZestHub
              </p>

            </div>

          </button>


          <button
            className="profile-action-card"
            onClick={() =>
              navigate("/profile/favorites")
            }
          >

            <span>
              ❤️
            </span>

            <div>

              <strong>
                My Favorites
              </strong>

              <p>
                Your saved restaurants
              </p>

            </div>

          </button>

        </div>


        {/* BOTTOM ACTIONS */}

        <div className="profile-bottom-actions">

          <button
            className="back-dashboard-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>


          <button
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </section>

    </div>
  );
}

export default Profile;