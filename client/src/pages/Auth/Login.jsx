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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      // Save authentication token
      localStorage.setItem(
        "zesthub_token",
        response.data.access_token
      );

      // Save logged-in user
      localStorage.setItem(
        "zesthub_user",
        JSON.stringify(response.data.user)
      );

      const user = response.data.user;

      setMessage("Login successful! Welcome to ZestHub 🍽️");

      // Role-based navigation
      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "owner") {
          navigate("/owner");
        } else {
          navigate("/dashboard");
        }
      }, 500);

    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(
          "Unable to login. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">

          <div className="login-icon">
            🍽️
          </div>

          <h1>Welcome Back</h1>

          <p>
            Login to continue exploring ZestHub
          </p>

        </div>

        {message && (
          <div className="login-success">
            {message}
          </div>
        )}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="login-footer">

          <p>
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