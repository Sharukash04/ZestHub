import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const API_URL = "http://127.0.0.1:8000";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("zesthub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserProfile(token);
  }, [navigate]);

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

      // Keep localStorage user information updated
      localStorage.setItem(
        "zesthub_user",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Failed to load profile:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("zesthub_token");
        localStorage.removeItem("zesthub_user");

        navigate("/login");
        return;
      }

      setError("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("zesthub_token");
    localStorage.removeItem("zesthub_user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          {error}

          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}

      <section className="profile-header">
        <div className="profile-header-content">

          <span className="profile-label">
            ZESTHUB ACCOUNT
          </span>

          <h1>👤 My Profile</h1>

          <p>
            Manage your ZestHub account and discover
            your food journey.
          </p>

        </div>
      </section>


      {/* MAIN */}

      <section className="profile-container">

        {/* PROFILE CARD */}

        <div className="profile-card">

          <div className="profile-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
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
              {user?.email || "No email available"}
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

              <h2>Personal Information</h2>

              <p>
                Your basic ZestHub account information.
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
                  {user?.name || "Not available"}
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
                  {user?.email || "Not available"}
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
                Tell ZestHub what you love to eat.
                Your preferences will later help us
                provide personalized restaurant
                recommendations.
              </p>

            </div>

            <div className="feature-status">
              Coming Soon
            </div>

          </div>

        </section>


        {/* USER FEATURES */}

        <div className="profile-actions">

          <button
            className="profile-action-card"
            onClick={() => navigate("/restaurants")}
          >
            <span>⭐</span>

            <div>
              <strong>My Reviews</strong>
              <p>Reviews you write on ZestHub</p>
            </div>
          </button>


          <button
            className="profile-action-card"
            onClick={() => navigate("/restaurants")}
          >
            <span>❤️</span>

            <div>
              <strong>My Favorites</strong>
              <p>Your saved restaurants</p>
            </div>
          </button>

        </div>


        {/* BUTTONS */}

        <div className="profile-bottom-actions">

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
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