import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        formData
      );

      const { access_token, user } = response.data;

      // Store authentication information
      localStorage.setItem("zesthub_token", access_token);
      localStorage.setItem("zesthub_user", JSON.stringify(user));

      setSuccess("Login successful! Welcome to ZestHub 🍽️");

      // Redirect to home
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 800);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to connect to ZestHub server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <div className="auth-brand">
            🍽️ ZestHub
          </div>

          <h1>
            Welcome <span>Back!</span>
          </h1>

          <p>
            Discover amazing restaurants, explore delicious food,
            and connect with the ZestHub community.
          </p>

          <div className="auth-features">
            <div>📍 Discover restaurants around you</div>
            <div>⭐ Read ratings and reviews</div>
            <div>❤️ Save your favorite restaurants</div>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-card-header">
            <h2>Login</h2>
            <p>Sign in to continue to ZestHub</p>
          </div>

          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">
              Create Account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;