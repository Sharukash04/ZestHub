import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("zesthub_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("zesthub_token");
    localStorage.removeItem("zesthub_user");

    setIsLoggedIn(false);

    navigate("/");

    window.location.reload();
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="logo">
        <Link to={isLoggedIn ? "/dashboard" : "/"}>
          🍽️ ZestHub
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/restaurants">
          Restaurants
        </Link>

        <Link to="/about">
          About
        </Link>

        {isLoggedIn ? (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            Login
          </Link>
        )}

      </div>

    </nav>
  );
}

export default Navbar;