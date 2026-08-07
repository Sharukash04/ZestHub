import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-logo">
        <Link to="/">
          🍽️ ZestHub
        </Link>
      </div>


      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/restaurants">
          Restaurants
        </Link>

        <Link to="/#community">
          Community
        </Link>

        <Link to="/#about">
          About
        </Link>

      </div>


      <div className="navbar-actions">

        <Link to="/login" className="login-button">
          Login
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;