import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/restaurants/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }

      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        <div className="admin-logo">
          <span>🍽️</span>
          <h2>ZestHub</h2>
        </div>

        <nav>
          <button className="active">
            📊 Dashboard
          </button>

          <button onClick={() => navigate("/admin/restaurants/add")}>
            ➕ Add Restaurant
          </button>

          <button>
            🍴 Restaurants
          </button>

          <button>
            ⭐ Reviews
          </button>

          <button>
            👥 Users
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

        <div className="admin-header">

          <div>
            <p className="admin-small-title">
              ZESTHUB ADMIN
            </p>

            <h1>Restaurant Dashboard</h1>

            <p>
              Manage your restaurants and food listings.
            </p>
          </div>

          <button
            className="add-restaurant-btn"
            onClick={() => navigate("/admin/restaurants/add")}
          >
            + Add Restaurant
          </button>

        </div>

        {/* Statistics */}
        <div className="admin-stats">

          <div className="stat-card">
            <div className="stat-icon">🍴</div>

            <div>
              <span>Total Restaurants</span>
              <h2>{restaurants.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>

            <div>
              <span>Average Rating</span>

              <h2>
                {restaurants.length > 0
                  ? (
                      restaurants.reduce(
                        (sum, restaurant) =>
                          sum + (restaurant.rating || 0),
                        0
                      ) / restaurants.length
                    ).toFixed(1)
                  : "0.0"}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📍</div>

            <div>
              <span>Locations</span>

              <h2>
                {
                  new Set(
                    restaurants.map(
                      (restaurant) => restaurant.location
                    )
                  ).size
                }
              </h2>
            </div>
          </div>

        </div>

        {/* Restaurant Section */}
        <section className="admin-restaurant-section">

          <div className="section-heading">

            <div>
              <h2>Restaurants</h2>
              <p>
                Manage your restaurant listings
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/restaurants/add")
              }
            >
              + Add Restaurant
            </button>

          </div>

          {loading ? (
            <div className="admin-loading">
              Loading restaurants...
            </div>
          ) : restaurants.length === 0 ? (
            <div className="admin-empty">
              <div>🍽️</div>

              <h3>No restaurants found</h3>

              <p>
                Start by adding your first restaurant.
              </p>

              <button
                onClick={() =>
                  navigate("/admin/restaurants/add")
                }
              >
                Add Restaurant
              </button>
            </div>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Restaurant</th>
                    <th>Location</th>
                    <th>Cuisine</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {restaurants.map((restaurant) => (

                    <tr key={restaurant.id}>

                      <td>
                        <div className="restaurant-name-cell">

                          <div className="restaurant-thumb">

                            {restaurant.image ? (
                              <img
                                src={
                                  restaurant.image.startsWith(
                                    "/uploads/"
                                  )
                                    ? `http://127.0.0.1:8000${restaurant.image}`
                                    : restaurant.image
                                }
                                alt={restaurant.name}
                              />
                            ) : (
                              <span>🍽️</span>
                            )}

                          </div>

                          <div>
                            <strong>
                              {restaurant.name}
                            </strong>

                            <small>
                              ID #{restaurant.id}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        📍 {restaurant.location}
                      </td>

                      <td>
                        {restaurant.cuisine}
                      </td>

                      <td>
                        <span className="rating-badge">
                          ⭐ {restaurant.rating || "N/A"}
                        </span>
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="view-btn"
                            onClick={() =>
                              navigate(
                                `/restaurant/${restaurant.id}`
                              )
                            }
                          >
                            View
                          </button>

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

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;