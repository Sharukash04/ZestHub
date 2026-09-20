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

  const storedUser = localStorage.getItem("zesthub_user");

  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Unable to read logged-in user:", error);
  }

  const isLoggedIn =
    !!token ||
    location.pathname === "/dashboard" ||
    location.pathname === "/owner" ||
    location.pathname === "/admin" ||
    location.pathname === "/profile";

  // Decide which dashboard to open based on role
  const getDashboardPath = () => {
    if (currentUser?.role === "admin") {
      return "/admin";
    }

    if (currentUser?.role === "owner") {
      return "/owner";
    }

    return "/dashboard";
  };

  const dashboardPath = getDashboardPath();

  const handleLogout = () => {
    localStorage.removeItem("zesthub_token");
    localStorage.removeItem("zesthub_user");

    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="logo">
        <Link to={isLoggedIn ? dashboardPath : "/"}>
          🍽️ ZestHub
        </Link>
      </div>

      {/* Navigation */}
      <div className="menu">

        {isLoggedIn ? (
          <>
            {/* Role-based Dashboard */}
            <Link to={dashboardPath}>
              Dashboard
            </Link>

            <Link to="/restaurants">
              Restaurants
            </Link>

            {/* Profile is mainly for customers */}
            {currentUser?.role !== "admin" && (
              <Link to="/profile">
                Profile
              </Link>
            )}

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