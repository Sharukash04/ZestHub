import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OwnerDashboard.css";

const API_URL = "http://127.0.0.1:8000";

function getStoredUser() {
  const storedUser = localStorage.getItem("zesthub_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("zesthub_user");
    return null;
  }
}

function OwnerDashboard() {
  const navigate = useNavigate();

  const [user] = useState(getStoredUser);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "owner") {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user || user.role !== "owner") {
      return;
    }

    let cancelled = false;

    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("zesthub_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/restaurants/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load restaurants");
        }

        const data = await response.json();

        const allRestaurants = Array.isArray(data)
          ? data
          : [];

        const myRestaurants = allRestaurants.filter(
          (restaurant) =>
            Number(restaurant.owner_id) === Number(user.id)
        );

        if (!cancelled) {
          setRestaurants(myRestaurants);
        }
      } catch (err) {
        console.error("Owner restaurant error:", err);

        if (!cancelled) {
          setError("Unable to load your restaurants.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRestaurants();

    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  const handleDelete = async (restaurantId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("zesthub_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/restaurants/${restaurantId}`,
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
          data.detail || "Failed to delete restaurant"
        );
      }

      setRestaurants((previous) =>
        previous.filter(
          (restaurant) =>
            restaurant.id !== restaurantId
        )
      );

      alert("Restaurant deleted successfully.");
    } catch (err) {
      console.error("Delete restaurant error:", err);
      alert(err.message);
    }
  };

  const handleManageMenu = (restaurantId) => {
    navigate(`/owner/restaurant/${restaurantId}/menu`);
  };

  if (loading) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-loading">
          <div className="owner-loading-icon">
            🍽️
          </div>

          <h2>Loading Owner Dashboard...</h2>

          <p>
            Getting your restaurants ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard-page">

      {/* HEADER */}

      <div className="owner-dashboard-header">

        <div>
          <span className="owner-label">
            🏪 Restaurant Owner
          </span>

          <h1>
            Welcome, {user?.name || "Owner"}!
          </h1>

          <p>
            Manage your restaurants and keep your
            ZestHub listings up to date.
          </p>
        </div>

        <div className="owner-header-actions">

          <button
            className="owner-profile-button"
            onClick={() => navigate("/profile")}
          >
            👤 Profile
          </button>

          <button
            className="owner-add-button"
            onClick={() =>
              navigate("/owner/add-restaurant")
            }
          >
            + Add Restaurant
          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="owner-summary-grid">

        <div className="owner-summary-card">

          <div className="owner-summary-icon">
            🏪
          </div>

          <div>
            <span>
              My Restaurants
            </span>

            <strong>
              {restaurants.length}
            </strong>
          </div>

        </div>

        <div className="owner-summary-card">

          <div className="owner-summary-icon">
            🍽️
          </div>

          <div>
            <span>
              Restaurant Management
            </span>

            <strong>
              Active
            </strong>
          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="owner-error">
          {error}
        </div>
      )}

      {/* RESTAURANTS */}

      <section className="owner-restaurants-section">

        <div className="owner-section-heading">

          <div>
            <span className="owner-section-label">
              My Business
            </span>

            <h2>
              My Restaurants
            </h2>

            <p>
              Add, edit and manage your restaurants.
            </p>
          </div>

          <button
            className="owner-add-small-button"
            onClick={() =>
              navigate("/owner/add-restaurant")
            }
          >
            + Add Restaurant
          </button>

        </div>

        {restaurants.length === 0 ? (

          <div className="owner-empty-state">

            <div className="owner-empty-icon">
              🏪
            </div>

            <h3>
              You haven't added a restaurant yet
            </h3>

            <p>
              Add your restaurant to start showcasing
              your business on ZestHub.
            </p>

            <button
              onClick={() =>
                navigate("/owner/add-restaurant")
              }
            >
              + Add Your Restaurant
            </button>

          </div>

        ) : (

          <div className="owner-restaurant-grid">

            {restaurants.map((restaurant) => (

              <div
                className="owner-restaurant-card"
                key={restaurant.id}
              >

                <div className="owner-card-top">

                  <div className="owner-card-icon">
                    🍴
                  </div>

                  <h3>
                    {restaurant.name}
                  </h3>

                  <div className="owner-rating">
                    ⭐{" "}
                    {restaurant.average_rating ??
                      restaurant.rating ??
                      0}
                  </div>

                  <p>
                    🍴 {restaurant.cuisine}
                  </p>

                  <p>
                    📍 {restaurant.location}
                  </p>

                  {restaurant.description && (
                    <p className="owner-description">
                      {restaurant.description}
                    </p>
                  )}

                </div>

                <div className="owner-card-actions">

                  <button
                    className="owner-view-button"
                    onClick={() =>
                      navigate(
                        `/restaurant/${restaurant.id}`
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    className="owner-edit-button"
                    onClick={() =>
                      navigate(
                        `/owner/edit-restaurant/${restaurant.id}`
                      )
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="owner-delete-button"
                    onClick={() =>
                      handleDelete(restaurant.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

                <button
                  className="owner-menu-button"
                  onClick={() =>
                    handleManageMenu(restaurant.id)
                  }
                >
                  🍽️ Manage Menu
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default OwnerDashboard;