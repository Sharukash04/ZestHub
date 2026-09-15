import "./Navbar.css";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("zesthub_token");

  const isLoggedIn =
    !!token ||
    location.pathname === "/dashboard" ||
    location.pathname === "/profile";

  const handleLogout = () => {
    localStorage.removeItem("zesthub_token");
    localStorage.removeItem("zesthub_user");

    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="logo">
        <Link to={isLoggedIn ? "/dashboard" : "/"}>
          🍽️ ZestHub
        </Link>
      </div>

      {/* Navigation */}
      <div className="menu">

        {isLoggedIn ? (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/restaurants">
              Restaurants
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            <button
              className="nav-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/">
              Home
            </Link>

            <Link to="/restaurants">
              Restaurants
            </Link>

            <Link
              to="/login"
              className="nav-button"
            >
              Login
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;