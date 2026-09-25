import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyReviews.css";

import API_URL from "../../../config";

function MyReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("zesthub_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/reviews/my-reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("zesthub_token");
            localStorage.removeItem("zesthub_user");
            navigate("/login");
            return;
          }

          throw new Error("Failed to load your reviews");
        }

        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("My reviews error:", error);
        setError("Unable to load your reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [token, navigate]);

  const handleDelete = async (reviewId) => {
    const confirmDelete = window.confirm(
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
        alert(data.detail || "Failed to delete review");
        return;
      }

      setReviews((previousReviews) =>
        previousReviews.filter(
          (review) => review.id !== reviewId
        )
      );
    } catch (error) {
      console.error("Delete review error:", error);
      alert("Something went wrong while deleting the review.");
    }
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-reviews-page">
        <div className="my-reviews-loading">
          <div className="loading-spinner"></div>
          <p>Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-reviews-page">
      {/* HEADER */}
      <div className="my-reviews-header">
        <button
          className="back-button"
          onClick={() => navigate("/profile")}
        >
          ? Back to Profile
        </button>

        <div className="my-reviews-title">
          <span className="my-reviews-label">
            ZESTHUB ACCOUNT
          </span>

          <h1>My Reviews</h1>

          <p>
            Manage the reviews you have shared on ZestHub.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="my-reviews-container">
        {error && (
          <div className="my-reviews-error">
            <p>{error}</p>

            <button
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && reviews.length === 0 && (
          <div className="my-reviews-empty">
            <div className="empty-icon">??</div>

            <h2>No Reviews Yet</h2>

            <p>
              You have not written any restaurant reviews yet.
              Explore restaurants and share your experience.
            </p>

            <button
              onClick={() => navigate("/restaurants")}
            >
              Explore Restaurants
            </button>
          </div>
        )}

        {!error && reviews.length > 0 && (
          <div className="my-reviews-list">
            {reviews.map((review) => (
              <article
                className="my-review-card"
                key={review.id}
              >
                {/* RESTAURANT HEADER */}
                <div className="review-restaurant">
                  <div className="review-restaurant-info">
                    <button
                      className="review-restaurant-button"
                      onClick={() =>
                        handleRestaurantClick(
                          review.restaurant_id
                        )
                      }
                    >
                      {review.restaurant_name}
                    </button>

                    {review.restaurant_location && (
                      <p>
                        ?? {review.restaurant_location}
                      </p>
                    )}

                    {review.restaurant_cuisine && (
                      <span className="review-cuisine">
                        {review.restaurant_cuisine}
                      </span>
                    )}
                  </div>

                  <div className="review-date">
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {/* REVIEW CONTENT */}
                <div className="review-content">
                  <p>{review.comment}</p>
                </div>

                {/* ACTIONS */}
                <div className="review-actions">
                  <button
                    className="view-restaurant-button"
                    onClick={() =>
                      handleRestaurantClick(
                        review.restaurant_id
                      )
                    }
                  >
                    View Restaurant
                  </button>

                  <button
                    className="delete-review-button"
                    onClick={() =>
                      handleDelete(review.id)
                    }
                  >
                    Delete Review
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReviews;
