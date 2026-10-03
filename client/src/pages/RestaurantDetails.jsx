import "./RestaurantDetails.css";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaUtensils,
  FaTrash,
} from "react-icons/fa";

import API_URL from "../config";

import {
  getRestaurantImage,
  FALLBACK_RESTAURANT_IMAGE,
} from "../utils/restaurantImage";

function RestaurantDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [restaurant, setRestaurant] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [averageRating, setAverageRating] =
    useState(0);

  const [totalRatings, setTotalRatings] =
    useState(0);

  const [myRating, setMyRating] =
    useState(null);

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [reviewText, setReviewText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [ratingLoading, setRatingLoading] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  // =====================================================
  // AUTH
  // =====================================================

  const token =
    localStorage.getItem(
      "zesthub_token"
    );

  // =====================================================
  // CURRENT USER
  // =====================================================

  let currentUser = null;

  try {
    const savedUser =
      localStorage.getItem(
        "zesthub_user"
      );

    if (savedUser) {
      currentUser =
        JSON.parse(savedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read current user:",
      error
    );
  }

  // =====================================================
  // FETCH RESTAURANT
  // =====================================================

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/restaurants/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Restaurant not found"
          );
        }

        const data =
          await response.json();

        setRestaurant(data);
      } catch (error) {
        console.error(
          "Restaurant fetch error:",
          error
        );

        setError(
          "Unable to load restaurant."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRestaurant();
    }
  }, [id]);

  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/reviews/restaurant/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load reviews"
          );
        }

        const data =
          await response.json();

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

        setReviews([]);
      }
    };

    if (id) {
      loadReviews();
    }
  }, [id]);

  // =====================================================
  // FETCH AVERAGE RATING
  // =====================================================

  useEffect(() => {
    const loadRating = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/ratings/restaurant/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load rating"
          );
        }

        const data =
          await response.json();

        setAverageRating(
          Number(
            data.average_rating || 0
          )
        );

        setTotalRatings(
          Number(
            data.total_ratings || 0
          )
        );
      } catch (error) {
        console.error(
          "Rating fetch error:",
          error
        );
      }
    };

    if (id) {
      loadRating();
    }
  }, [id]);

  // =====================================================
  // FETCH CURRENT USER RATING
  // =====================================================

  useEffect(() => {
    const loadMyRating = async () => {
      if (!token) {
        setMyRating(null);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/ratings/restaurant/${id}/my-rating`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (data.has_rated) {
          const rating =
            Number(data.rating);

          setMyRating(rating);
          setSelectedRating(rating);
        } else {
          setMyRating(null);
          setSelectedRating(0);
        }
      } catch (error) {
        console.error(
          "My rating fetch error:",
          error
        );
      }
    };

    if (id) {
      loadMyRating();
    }
  }, [id, token]);

  // =====================================================
  // FETCH FAVORITE STATUS
  // =====================================================

  useEffect(() => {
    const loadFavoriteStatus =
      async () => {
        if (!token) {
          setIsFavorite(false);
          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/api/favorites/restaurant/${id}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          if (
            typeof data ===
            "boolean"
          ) {
            setIsFavorite(data);
          } else {
            setIsFavorite(
              Boolean(
                data.is_favorite ??
                  data.favorite ??
                  data.exists ??
                  false
              )
            );
          }
        } catch (error) {
          console.error(
            "Favorite status error:",
            error
          );
        }
      };

    if (id) {
      loadFavoriteStatus();
    }
  }, [id, token]);

  // =====================================================
  // STAR DISPLAY
  // =====================================================

  const renderStars = (
    rating,
    interactive = false
  ) => {
    const numericRating =
      Number(rating || 0);

    return (
      <div
        className={
          interactive
            ? "restaurant-rating-stars interactive"
            : "restaurant-rating-stars"
        }
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type={
                interactive
                  ? "button"
                  : "button"
              }
              className={
                star <= numericRating
                  ? "star active"
                  : "star"
              }
              onClick={
                interactive
                  ? () =>
                      setSelectedRating(
                        star
                      )
                  : undefined
              }
              disabled={
                !interactive ||
                ratingLoading
              }
              aria-label={
                interactive
                  ? `Rate ${star} out of 5`
                  : undefined
              }
            >
              <FaStar />
            </button>
          )
        )}
      </div>
    );
  };

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  const requireLogin = () => {
    if (!token) {
      alert(
        "Please login to continue."
      );

      navigate("/login");

      return false;
    }

    return true;
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite = async () => {
    if (!requireLogin()) {
      return;
    }

    try {
      setFavoriteLoading(true);

      const response = await fetch(
        `${API_URL}/api/favorites/restaurant/${id}`,
        {
          method: isFavorite
            ? "DELETE"
            : "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Unable to update favorite"
        );
      }

      setIsFavorite(
        !isFavorite
      );
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      alert(
        error.message ||
          "Unable to update favorite."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =====================================================
  // SUBMIT RATING
  // =====================================================

  const handleRating = async () => {
    if (!requireLogin()) {
      return;
    }

    if (!selectedRating) {
      alert(
        "Please select a rating."
      );

      return;
    }

    try {
      setRatingLoading(true);

      /*
       * IMPORTANT:
       *
       * Backend endpoint is:
       * POST /api/ratings/
       *
       * NOT:
       * POST /api/ratings/restaurant/:id
       */

      const response = await fetch(
        `${API_URL}/api/ratings/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            restaurant_id:
              Number(id),

            rating:
              Number(
                selectedRating
              ),
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to submit rating."
        );
      }

      // Update current rating
      const returnedRating =
        Number(
          data.rating ??
            selectedRating
        );

      setMyRating(
        returnedRating
      );

      setSelectedRating(
        returnedRating
      );

      // Update average rating
      if (
        data.average_rating !==
        undefined
      ) {
        setAverageRating(
          Number(
            data.average_rating
          )
        );
      }

      // Refresh rating information
      try {
        const ratingResponse =
          await fetch(
            `${API_URL}/api/ratings/restaurant/${id}`
          );

        if (
          ratingResponse.ok
        ) {
          const ratingData =
            await ratingResponse.json();

          setAverageRating(
            Number(
              ratingData.average_rating ||
                0
            )
          );

          setTotalRatings(
            Number(
              ratingData.total_ratings ||
                0
            )
          );
        }
      } catch (refreshError) {
        console.error(
          "Rating refresh error:",
          refreshError
        );
      }

    } catch (error) {
      console.error(
        "Rating submission error:",
        error
      );

      alert(
        error.message ||
          "Unable to submit rating."
      );
    } finally {
      setRatingLoading(false);
    }
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleReviewSubmit =
    async (event) => {
      event.preventDefault();

      if (!requireLogin()) {
        return;
      }

      const trimmedReview =
        reviewText.trim();

      if (!trimmedReview) {
        alert(
          "Please write a review."
        );

        return;
      }

      try {
        setReviewLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/reviews/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                restaurant_id:
                  Number(id),

                comment:
                  trimmedReview,
              }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to submit review."
          );
        }

        setReviewText("");

        // Reload reviews
        const reviewsResponse =
          await fetch(
            `${API_URL}/api/reviews/restaurant/${id}`
          );

        if (
          reviewsResponse.ok
        ) {
          const reviewsData =
            await reviewsResponse.json();

          setReviews(
            Array.isArray(
              reviewsData
            )
              ? reviewsData
              : []
          );
        }
      } catch (error) {
        console.error(
          "Review submission error:",
          error
        );

        alert(
          error.message ||
            "Unable to submit review."
        );
      } finally {
        setReviewLoading(false);
      }
    };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

  const handleDeleteReview =
    async (reviewId) => {
      if (!requireLogin()) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/reviews/${reviewId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to delete review."
          );
        }

        setReviews(
          (previousReviews) =>
            previousReviews.filter(
              (review) =>
                review.id !==
                reviewId
            )
        );
      } catch (error) {
        console.error(
          "Delete review error:",
          error
        );

        alert(
          error.message ||
            "Unable to delete review."
        );
      }
    };

  // =====================================================
  // REVIEW USER NAME
  // =====================================================

  const getReviewUserName =
    (review) => {
      return (
        review.user?.name ||
        review.user?.username ||
        review.user?.full_name ||
        review.username ||
        review.user_name ||
        "ZestHub User"
      );
    };

  // =====================================================
  // REVIEW COMMENT
  // =====================================================

  const getReviewComment =
    (review) => {
      return (
        review.comment ||
        review.content ||
        review.text ||
        ""
      );
    };

  // =====================================================
  // CHECK REVIEW OWNER
  // =====================================================

  const isMyReview = (
    review
  ) => {
    if (!currentUser) {
      return false;
    }

    const currentUserId =
      currentUser.id ??
      currentUser.user_id;

    const reviewUserId =
      review.user_id ??
      review.user?.id ??
      review.userId;

    if (
      currentUserId !==
        undefined &&
      reviewUserId !==
        undefined
    ) {
      return (
        Number(currentUserId) ===
        Number(reviewUserId)
      );
    }

    return false;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="restaurant-details-page">

        <div className="restaurant-details-loading">

          <div className="loading-spinner" />

          <p>
            Loading restaurant...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !restaurant) {
    return (
      <div className="restaurant-details-page">

        <div className="restaurant-details-error">

          <h2>
            Restaurant not found
          </h2>

          <p>
            {error ||
              "The restaurant you are looking for does not exist."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            <FaArrowLeft />
            Back to Restaurants
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // RESTAURANT IMAGE
  // =====================================================

  const restaurantImage =
    getRestaurantImage(
      restaurant.image
    );

  // =====================================================
  // DISPLAY RATING
  // =====================================================

  const displayRating =
    Number(
      averageRating ||
        restaurant.average_rating ||
        restaurant.rating ||
        0
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="restaurant-details-page">

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <div className="restaurant-details-container">

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/restaurants")
          }
        >
          <FaArrowLeft />

          Back to Restaurants

        </button>

        {/* =================================================
            RESTAURANT HERO
        ================================================= */}

        <section className="restaurant-details-hero">

          {/* IMAGE */}

          <div className="restaurant-details-image-wrapper">

            <img
              src={restaurantImage}
              alt={
                restaurant.name ||
                "Restaurant"
              }
              className="restaurant-details-image"
              onError={(event) => {
                event.currentTarget.onerror =
                  null;

                event.currentTarget.src =
                  FALLBACK_RESTAURANT_IMAGE;
              }}
            />

          </div>

          {/* INFORMATION */}

          <div className="restaurant-details-content">

            <div className="restaurant-details-title-row">

              <div>

                <span className="restaurant-details-label">
                  <FaUtensils />
                  ZestHub Restaurant
                </span>

                <h1>
                  {restaurant.name}
                </h1>

              </div>

              <button
                type="button"
                className={
                  isFavorite
                    ? "favorite-button active"
                    : "favorite-button"
                }
                onClick={
                  handleFavorite
                }
                disabled={
                  favoriteLoading
                }
                aria-label={
                  isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <FaHeart />
              </button>

            </div>

            {/* LOCATION */}

            <div className="restaurant-detail-location">

              <FaMapMarkerAlt />

              <span>
                {restaurant.location ||
                  "Location unavailable"}
              </span>

            </div>

            {/* CUISINE */}

            <div className="restaurant-detail-cuisine">

              <FaUtensils />

              <span>
                {restaurant.cuisine ||
                  "Restaurant"}
              </span>

            </div>

            {/* RATING */}

            <div className="restaurant-detail-rating">

              <div className="rating-number">
                {displayRating > 0
                  ? displayRating.toFixed(
                      1
                    )
                  : "New"}
              </div>

              {renderStars(
                displayRating
              )}

              <span className="rating-count">
                {totalRatings}{" "}
                {totalRatings === 1
                  ? "rating"
                  : "ratings"}
              </span>

            </div>

            {/* DESCRIPTION */}

            {restaurant.description && (
              <p className="restaurant-description">
                {restaurant.description}
              </p>
            )}

          </div>

        </section>

        {/* =================================================
            COMMUNITY RATING
        ================================================= */}

        <section className="restaurant-rating-section">

          <div className="restaurant-section-heading">

            <span className="restaurant-section-label">
              <FaStar />
              Your Rating
            </span>

            <h2>
              Rate This Restaurant
            </h2>

            <p>
              Share your experience with
              the ZestHub community.
            </p>

          </div>

          <div className="restaurant-rating-box">

            <div className="your-rating-stars">

              {renderStars(
                selectedRating,
                true
              )}

            </div>

            {myRating && (
              <p className="current-rating-text">
                Your current rating:{" "}
                <strong>
                  {Number(
                    myRating
                  ).toFixed(1)}
                </strong>
              </p>
            )}

            <button
              type="button"
              className="submit-rating-button"
              onClick={
                handleRating
              }
              disabled={
                ratingLoading ||
                !selectedRating
              }
            >
              {ratingLoading
                ? "Saving..."
                : myRating
                ? "Update Rating"
                : "Submit Rating"}

              <FaArrowRight />
            </button>

          </div>

        </section>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className="restaurant-reviews-section">

          <div className="restaurant-section-heading">

            <span className="restaurant-section-label">
              <FaCommentsIcon />
              Community
            </span>

            <h2>
              Reviews
            </h2>

            <p>
              See what other ZestHub users
              think about this restaurant.
            </p>

          </div>

          {/* =================================================
              REVIEW FORM
          ================================================= */}

          <div className="restaurant-review-form">

            <form
              onSubmit={
                handleReviewSubmit
              }
            >

              <textarea
                value={reviewText}
                onChange={(event) =>
                  setReviewText(
                    event.target.value
                  )
                }
                placeholder={
                  token
                    ? "Write your review..."
                    : "Login to write a review..."
                }
                disabled={
                  !token ||
                  reviewLoading
                }
                rows={5}
              />

              <div className="review-form-footer">

                {!token && (
                  <Link
                    to="/login"
                    className="login-review-link"
                  >
                    Login to write a review
                  </Link>
                )}

                <button
                  type="submit"
                  className="submit-review-button"
                  disabled={
                    !token ||
                    reviewLoading ||
                    !reviewText.trim()
                  }
                >
                  {reviewLoading
                    ? "Submitting..."
                    : "Post Review"}

                  <FaArrowRight />
                </button>

              </div>

            </form>

          </div>

          {/* =================================================
              REVIEW LIST
          ================================================= */}

          <div className="restaurant-reviews-list">

            {reviews.length === 0 ? (

              <div className="no-reviews">

                <FaCommentsIcon />

                <h3>
                  No reviews yet
                </h3>

                <p>
                  Be the first person to
                  share your experience.
                </p>

              </div>

            ) : (

              reviews.map(
                (review) => {

                  const reviewUser =
                    getReviewUserName(
                      review
                    );

                  const comment =
                    getReviewComment(
                      review
                    );

                  return (
                    <article
                      className="review-card"
                      key={
                        review.id
                      }
                    >

                      <div className="review-card-header">

                        <div className="review-user">

                          <div className="review-avatar">
                            {reviewUser
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <h3>
                              {reviewUser}
                            </h3>

                            {review.created_at && (
                              <span>
                                {new Date(
                                  review.created_at
                                ).toLocaleDateString()}
                              </span>
                            )}

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
                                review.id
                              )
                            }
                            title="Delete review"
                          >
                            <FaTrash />
                          </button>
                        )}

                      </div>

                      {review.rating && (
                        <div className="review-rating">
                          {renderStars(
                            Number(
                              review.rating
                            )
                          )}
                        </div>
                      )}

                      <p className="review-comment">
                        {comment}
                      </p>

                    </article>
                  );
                }
              )

            )}

          </div>

        </section>

        {/* =================================================
            BOTTOM BACK BUTTON
        ================================================= */}

        <div className="restaurant-details-bottom">

          <button
            type="button"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            <FaArrowLeft />

            Back to Restaurants

          </button>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// SMALL ICON HELPER
// =========================================================
//
// We use FaComments through a tiny component so the JSX
// remains clean.
// =========================================================

function FaCommentsIcon() {
  return (
    <span className="comments-icon">
      💬
    </span>
  );
}

export default RestaurantDetails;