import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/restaurants/"
        );

        if (!response.ok) {
          throw new Error("Failed to load restaurants.");
        }

        const data = await response.json();

        if (!cancelled) {
          setRestaurants(data);
        }
      } catch (err) {
        console.error("Restaurant fetch error:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load restaurants."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRestaurants();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteClick = (restaurant) => {
    setMessage("");
    setError("");
    setRestaurantToDelete(restaurant);
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setRestaurantToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!restaurantToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/restaurants/${restaurantToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to delete restaurant."
        );
      }

      setRestaurants((previousRestaurants) =>
        previousRestaurants.filter(
          (restaurant) =>
            restaurant.id !== restaurantToDelete.id
        )
      );

      setMessage(
        `"${restaurantToDelete.name}" deleted successfully.`
      );

      setRestaurantToDelete(null);
    } catch (err) {
      console.error("Delete restaurant error:", err);

      setError(
        err.message || "Unable to delete restaurant."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getRestaurantImage = (image) => {
    if (!image) {
      return null;
    }

    if (image.startsWith("/uploads/")) {
      return `http://127.0.0.1:8000${image}`;
    }

    return image;
  };

  const getRating = (restaurant) => {
    return Number(
      restaurant.average_rating ?? restaurant.rating ?? 0
    ).toFixed(1);
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>🍽️</span>
          <h2>ZestHub</h2>
        </div>

        <nav>
          <button
            className="active"
            onClick={() => navigate("/admin")}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/admin/restaurants/add")
            }
          >
            ➕ Add Restaurant
          </button>

          <button
            onClick={() => navigate("/restaurants")}
          >
            🍴 View Restaurants
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button onClick={() => navigate("/")}>
            🏠 Back to ZestHub
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div>
            <p className="admin-welcome">
              Welcome back 👋
            </p>

            <h1>Admin Dashboard</h1>

            <p className="admin-subtitle">
              Manage your restaurants and listings from here.
            </p>
          </div>

          <button
            className="add-restaurant-btn"
            onClick={() =>
              navigate("/admin/restaurants/add")
            }
          >
            + Add Restaurant
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="admin-success-message">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="admin-error-message">
            <span>!</span>
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>

            <div>
              <span>Total Restaurants</span>

              <strong>{restaurants.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📍</div>

            <div>
              <span>Locations</span>

              <strong>
                {
                  new Set(
                    restaurants.map(
                      (restaurant) =>
                        restaurant.location
                    )
                  ).size
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Restaurant Section */}
        <section className="admin-restaurants-section">
          <div className="section-heading">
            <div>
              <h2>Restaurant Management</h2>

              <p>
                View, edit or delete restaurant listings.
              </p>
            </div>

            <span className="restaurant-count">
              {restaurants.length} Restaurants
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="admin-loading">
              <div className="loading-spinner"></div>

              <p>Loading restaurants...</p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            restaurants.length === 0 &&
            !error && (
              <div className="admin-empty">
                <div className="empty-icon">🍽️</div>

                <h3>No Restaurants Yet</h3>

                <p>
                  Add your first restaurant to get started.
                </p>

                <button
                  onClick={() =>
                    navigate("/admin/restaurants/add")
                  }
                >
                  + Add Restaurant
                </button>
              </div>
            )}

          {/* Restaurant List */}
          {!loading &&
            restaurants.length > 0 && (
              <div className="restaurant-table">
                {/* Table Header */}
                <div className="restaurant-table-header">
                  <div>Restaurant</div>
                  <div>Location</div>
                  <div>Cuisine</div>
                  <div>Rating</div>
                  <div>Actions</div>
                </div>

                {/* Rows */}
                {restaurants.map((restaurant) => (
                  <div
                    className="restaurant-row"
                    key={restaurant.id}
                  >
                    {/* Restaurant */}
                    <div className="restaurant-cell restaurant-name-cell">
                      <div className="admin-restaurant-image">
                        {getRestaurantImage(
                          restaurant.image
                        ) ? (
                          <img
                            src={getRestaurantImage(
                              restaurant.image
                            )}
                            alt={restaurant.name}
                          />
                        ) : (
                          <div className="no-image">
                            🍽️
                          </div>
                        )}
                      </div>

                      <div>
                        <h3>{restaurant.name}</h3>

                        <span>
                          ID #{restaurant.id}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="restaurant-cell location-cell">
                      <span className="cell-icon">
                        📍
                      </span>

                      <span>
                        {restaurant.location}
                      </span>
                    </div>

                    {/* Cuisine */}
                    <div className="restaurant-cell cuisine-cell">
                      {restaurant.cuisine}
                    </div>

                    {/* Rating */}
                    <div className="restaurant-cell rating-cell">
                      <span className="rating-badge">
                        ⭐ {getRating(restaurant)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="restaurant-cell actions-cell">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(
                            `/admin/restaurants/edit/${restaurant.id}`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteClick(restaurant)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {restaurantToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-icon">
              ⚠️
            </div>

            <h2>Delete Restaurant?</h2>

            <p>
              Are you sure you want to
              <strong>
                {" "}
                "{restaurantToDelete.name}"
              </strong>
              ?
            </p>

            <span className="delete-warning">
              This action cannot be undone.
            </span>

            <div className="delete-modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="modal-delete-btn"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
