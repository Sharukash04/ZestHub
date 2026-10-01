import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RestaurantDetails.css";

import API_URL from "../config";

// ==========================================
// LOCAL IMAGES
// ==========================================

import biryaniImage from "../assets/images/biryani.jpg";
import burgerImage from "../assets/images/burger.jpg";
import cafeImage from "../assets/images/cafe.jpg";
import dessertsImage from "../assets/images/desserts.jpg";
import heroFoodImage from "../assets/images/hero-food.jpg";
import keralaFoodImage from "../assets/images/Kerala Food Court.jpg";
import pizzaImage from "../assets/images/pizza.jpg";
import restaurant1Image from "../assets/images/restaurant1.jpg";
import restaurant2Image from "../assets/images/restaurant2.jpg";
import restaurant3Image from "../assets/images/restaurant3.jpg";

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
  "kerala-food-court.jpg": keralaFoodImage,

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

  "pizza-hut.jpg": pizzaImage,
  "pizza hut.jpg": pizzaImage,

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

// ==========================================
// STAR DISPLAY
// ==========================================

const renderStars = (value = 0) => {
  const numericValue = Number(value) || 0;

  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(numericValue)
              ? "star filled"
              : "star"
          }
        >
          ★
        </span>
      ))}
    </>
  );
};

// ==========================================
// RESTAURANT DETAILS
// ==========================================

function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // RESTAURANT STATE
  // ========================================

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // RATING STATE
  // ========================================

  const [rating, setRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // ========================================
  // REVIEW STATE
  // ========================================

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // ========================================
  // FAVORITE STATE
  // ========================================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // ==========================================
  // CURRENT USER
  // ==========================================

  let currentUser = null;

  const storedUser = localStorage.getItem("zesthub_user");

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      currentUser = null;
    }
  }

  // ==========================================
  // FETCH RESTAURANT
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadRestaurant = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/restaurants/${id}`
        );

        if (!response.ok) {
          throw new Error("Restaurant not found");
        }

        const data = await response.json();

        if (!cancelled) {
          setRestaurant(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Restaurant fetch error:",
          error
        );

        if (!cancelled) {
          setRestaurant(null);
          setLoading(false);
        }
      }
    };

    loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================
  // FETCH REVIEWS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/reviews/restaurant/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (!cancelled) {
          setReviews(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Reviews fetch error:",
          error
        );

        if (!cancelled) {
          setReviews([]);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================
  // FETCH AVERAGE RATING
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadRating = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/ratings/restaurant/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch rating");
        }

        const data = await response.json();

        if (!cancelled) {
          setRating(
            Number(data.average_rating) || 0
          );
        }
      } catch (error) {
        console.error(
          "Rating fetch error:",
          error
        );
      }
    };

    loadRating();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================
  // FETCH CURRENT USER RATING
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadMyRating = async () => {
      const token =
        localStorage.getItem("zesthub_token");

      if (!token) {
        if (!cancelled) {
          setMyRating(0);
        }

        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/ratings/restaurant/${id}/my-rating`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setMyRating(0);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setMyRating(
            Number(data.rating) || 0
          );
        }
      } catch (error) {
        console.error(
          "My rating error:",
          error
        );
      }
    };

    loadMyRating();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================
  // CHECK FAVORITE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadFavoriteStatus = async () => {
      const token =
        localStorage.getItem("zesthub_token");

      if (!token) {
        if (!cancelled) {
          setIsFavorite(false);
        }

        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/favorites/restaurant/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setIsFavorite(false);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setIsFavorite(
            Boolean(data.is_favorite)
          );
        }
      } catch (error) {
        console.error(
          "Favorite check error:",
          error
        );

        if (!cancelled) {
          setIsFavorite(false);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================
  // IMAGE RESOLVER
  // ==========================================

  const getRestaurantImage = () => {
    if (!restaurant?.image) {
      return restaurant1Image;
    }

    const imageValue =
      String(restaurant.image).trim();

    // Full URL
    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://")
    ) {
      return imageValue;
    }

    // Normalize filename
    const normalizedName =
      normalizeImageName(imageValue);

    // Local image map
    if (imageMap[normalizedName]) {
      return imageMap[normalizedName];
    }

    // Backend uploads path
    if (imageValue.startsWith("/uploads/")) {
      return `${API_URL}${imageValue}`;
    }

    if (imageValue.startsWith("uploads/")) {
      return `${API_URL}/${imageValue}`;
    }

    // Backend filename
    return `${API_URL}/uploads/${imageValue}`;
  };

  // ==========================================
  // IMAGE ERROR FALLBACK
  // ==========================================

  const handleImageError = (event) => {
    console.warn(
      "Restaurant image could not be loaded:",
      restaurant?.image
    );

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
  // REFRESH REVIEWS
  // ==========================================

  const refreshReviews = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/reviews/restaurant/${id}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch reviews"
        );
      }

      const data = await response.json();

      setReviews(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Reviews fetch error:",
        error
      );
    }
  };

  // ==========================================
  // REFRESH RATING
  // ==========================================

  const refreshRating = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ratings/restaurant/${id}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch rating"
        );
      }

      const data = await response.json();

      setRating(
        Number(data.average_rating) || 0
      );
    } catch (error) {
      console.error(
        "Rating fetch error:",
        error
      );
    }
  };

  // ==========================================
  // HANDLE FAVORITE
  // ==========================================

  const handleFavorite = async () => {
    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      alert(
        "Please login to add restaurants to your favorites."
      );

      navigate("/login");

      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        const response = await fetch(
          `${API_URL}/api/favorites/restaurant/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to remove favorite"
          );
        }

        setIsFavorite(false);
      } else {
        const response = await fetch(
          `${API_URL}/api/favorites/restaurant/${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to add favorite"
          );
        }

        setIsFavorite(true);
      }
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ==========================================
  // HANDLE RATING
  // ==========================================

  const handleRating = async (
    selectedRating
  ) => {
    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      alert(
        "Please login to rate this restaurant."
      );

      navigate("/login");

      return;
    }

    try {
      setRatingLoading(true);

      const response = await fetch(
        `${API_URL}/api/ratings/restaurant/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to submit rating"
        );
      }

      setMyRating(selectedRating);

      await refreshRating();
    } catch (error) {
      console.error(
        "Rating error:",
        error
      );

      alert(
        error.message ||
          "Failed to submit rating."
      );
    } finally {
      setRatingLoading(false);
    }
  };

  // ==========================================
  // HANDLE REVIEW SUBMIT
  // ==========================================

  const handleReviewSubmit = async (
    event
  ) => {
    event.preventDefault();

    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      alert(
        "Please login to write a review."
      );

      navigate("/login");

      return;
    }

    const trimmedReview =
      reviewText.trim();

    if (!trimmedReview) {
      alert("Please write a review.");
      return;
    }

    if (trimmedReview.length < 3) {
      alert(
        "Review must contain at least 3 characters."
      );

      return;
    }

    try {
      setReviewLoading(true);

      const response = await fetch(
        `${API_URL}/api/reviews/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            restaurant_id: Number(id),
            comment: trimmedReview,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to submit review"
        );
      }

      setReviewText("");

      await refreshReviews();
    } catch (error) {
      console.error(
        "Review error:",
        error
      );

      alert(
        error.message ||
          "Failed to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // ==========================================
  // DELETE REVIEW
  // ==========================================

  const handleDeleteReview = async (
    reviewId
  ) => {
    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      return;
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this review?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete review"
        );
      }

      await refreshReviews();
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete review."
      );
    }
  };

  // ==========================================
  // GET REVIEW USER NAME
  // ==========================================

  const getReviewUserName = (review) => {
    return (
      review?.user?.name ||
      review?.user?.username ||
      review?.user?.full_name ||
      review?.username ||
      review?.user_name ||
      review?.name ||
      "ZestHub User"
    );
  };

  // ==========================================
  // GET REVIEW COMMENT
  // ==========================================

  const getReviewComment = (review) => {
    return (
      review?.comment ||
      review?.review ||
      review?.text ||
      ""
    );
  };

  // ==========================================
  // CHECK REVIEW OWNER
  // ==========================================

  const isMyReview = (review) => {
    if (!currentUser || !review) {
      return false;
    }

    const currentUserId =
      currentUser.id ||
      currentUser.user_id;

    const reviewUserId =
      review.user_id ||
      review.userId ||
      review.user?.id;

    if (
      currentUserId &&
      reviewUserId
    ) {
      return (
        Number(currentUserId) ===
        Number(reviewUserId)
      );
    }

    return false;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="restaurant-details-page">
        <div className="restaurant-loading">
          <h2>
            Loading restaurant...
          </h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!restaurant) {
    return (
      <div className="restaurant-details-page">
        <div className="restaurant-not-found">
          <h2>
            Restaurant not found
          </h2>

          <p>
            We could not find the restaurant
            you are looking for.
          </p>

          <button
            onClick={() =>
              navigate("/restaurants")
            }
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="restaurant-details-page">

      <div className="restaurant-details-card">

        {/* ======================================
            HERO
        ====================================== */}

        <div className="restaurant-hero">

          <img
            src={getRestaurantImage()}
            alt={restaurant.name}
            className="restaurant-main-image"
            onError={handleImageError}
          />

          <div className="restaurant-hero-overlay">

            <div className="restaurant-title-area">

              <span className="restaurant-category">
                🍽️{" "}
                {restaurant.cuisine ||
                  "Restaurant"}
              </span>

              <h1>
                {restaurant.name}
              </h1>

              <p className="restaurant-location">
                📍{" "}
                {restaurant.location ||
                  "Location unavailable"}
              </p>

            </div>

            {/* FAVORITE BUTTON */}

            <button
              className={`favorite-button ${
                isFavorite
                  ? "favorite-active"
                  : ""
              }`}
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              {favoriteLoading
                ? "Saving..."
                : isFavorite
                ? "❤️ Saved"
                : "🤍 Add to Favorites"}
            </button>

          </div>
        </div>

        {/* ======================================
            RESTAURANT INFORMATION
        ====================================== */}

        <div className="restaurant-info">

          <div className="info-item">

            <span className="info-icon">
              🍴
            </span>

            <div>
              <strong>
                {restaurant.cuisine ||
                  "Various"}
              </strong>

              <small>
                Cuisine
              </small>
            </div>

          </div>

          <div className="info-item">

            <span className="info-icon">
              📍
            </span>

            <div>
              <strong>
                Location
              </strong>

              <small>
                {restaurant.location ||
                  "Not available"}
              </small>
            </div>

          </div>

          <div className="info-item">

            <span className="info-icon">
              ⭐
            </span>

            <div>
              <strong>
                {Number(rating).toFixed(1)}
              </strong>

              <small>
                Community Rating
              </small>
            </div>

          </div>

        </div>

        {/* ======================================
            DESCRIPTION
        ====================================== */}

        <section className="restaurant-description-section">

          <h2>
            About this Restaurant
          </h2>

          <p>
            {restaurant.description ||
              "Discover delicious food and a great dining experience at this restaurant."}
          </p>

        </section>

        {/* ======================================
            COMMUNITY
        ====================================== */}

        <section className="community-section">

          <div className="community-heading">

            <span>
              👥
            </span>

            <div>
              <h2>
                ZestHub Community
              </h2>

              <p>
                Share your experience and help
                other food lovers.
              </p>
            </div>

          </div>

          {/* ====================================
              RATING CARD
          ==================================== */}

          <div className="rating-card">

            <div className="section-header">

              <h3>
                Restaurant Rating
              </h3>

              <div className="average-rating">

                <span className="rating-number">
                  {Number(rating).toFixed(1)}
                </span>

                <span className="rating-stars">
                  {renderStars(rating)}
                </span>

              </div>

            </div>

            <p className="rating-description">
              {myRating
                ? `You rated this restaurant ${myRating} out of 5.`
                : "How would you rate this restaurant?"}
            </p>

            <div className="rating-selector">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star-button ${
                      star <= myRating
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleRating(star)
                    }
                    disabled={ratingLoading}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    ★
                  </button>
                )
              )}

            </div>

            {ratingLoading && (
              <p className="rating-loading-text">
                Saving your rating...
              </p>
            )}

          </div>

          {/* ====================================
              REVIEW FORM
          ==================================== */}

          <div className="review-form-card">

            <div className="section-header">

              <h3>
                Write a Review
              </h3>

            </div>

            <form
              onSubmit={handleReviewSubmit}
              className="review-form"
            >

              <textarea
                value={reviewText}
                onChange={(event) =>
                  setReviewText(
                    event.target.value
                  )
                }
                placeholder="Share your experience with this restaurant..."
                rows="5"
                maxLength="1000"
                disabled={reviewLoading}
              />

              <div className="review-form-footer">

                <span className="review-character-count">
                  {reviewText.length}/1000
                </span>

                <button
                  type="submit"
                  disabled={
                    reviewLoading ||
                    !reviewText.trim()
                  }
                >
                  {reviewLoading
                    ? "Posting..."
                    : "Post Review"}
                </button>

              </div>

            </form>

          </div>

          {/* ====================================
              REVIEWS LIST
          ==================================== */}

          <div className="reviews-section">

            <div className="section-header">

              <h3>
                Customer Reviews
              </h3>

              <span className="review-count">
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "Review"
                  : "Reviews"}
              </span>

            </div>

            {reviews.length === 0 ? (
              <div className="no-reviews">

                <div className="no-reviews-icon">
                  💬
                </div>

                <h4>
                  No reviews yet
                </h4>

                <p>
                  Be the first person to
                  share your experience!
                </p>

              </div>
            ) : (
              <div className="reviews-list">

                {reviews.map(
                  (review, index) => {

                    const reviewComment =
                      getReviewComment(
                        review
                      );

                    const reviewRating =
                      Number(
                        review.rating
                      ) || 0;

                    const reviewId =
                      review.id ||
                      review.review_id ||
                      index;

                    return (
                      <article
                        className="review-card"
                        key={reviewId}
                      >

                        <div className="review-header">

                          <div className="review-user">

                            <div className="review-avatar">
                              {getReviewUserName(
                                review
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {getReviewUserName(
                                  review
                                )}
                              </strong>

                              <small>
                                {review.created_at
                                  ? new Date(
                                      review.created_at
                                    ).toLocaleDateString()
                                  : "ZestHub Community"}
                              </small>

                            </div>

                          </div>

                          {isMyReview(
                            review
                          ) && (
                            <button
                              type="button"
                              className="delete-review-button"
                              onClick={() =>
                                handleDeleteReview(
                                  reviewId
                                )
                              }
                            >
                              Delete
                            </button>
                          )}

                        </div>

                        {reviewRating > 0 && (
                          <div className="review-rating">
                            {renderStars(
                              reviewRating
                            )}
                          </div>
                        )}

                        <p className="review-comment">
                          {reviewComment ||
                            "No comment provided."}
                        </p>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </section>

        {/* ======================================
            BACK BUTTON
        ====================================== */}

        <div className="restaurant-details-actions">

          <button
            type="button"
            onClick={() =>
              navigate("/restaurants")
            }
            className="back-to-restaurants"
          >
            ← Back to Restaurants
          </button>

        </div>

      </div>

    </div>
  );
}

export default RestaurantDetails;