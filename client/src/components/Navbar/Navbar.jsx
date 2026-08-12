import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <Link to="/">
          ZestHub
        </Link>
      </div>

      <div className="menu">

        <Link to="/">
          Home
        </Link>

        <Link to="/restaurants">
          Restaurants
        </Link>

        <Link to="/about">
          About
        </Link>

        <Link to="/login">
          Login
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;