import "./Navbar.css";

function Navbar() {
  return (
    <nav>
      <h2 className="logo">ZestHub</h2>

      <div className="menu">
        <a href="#">Home</a>
        <a href="#">Restaurants</a>
        <a href="#">About</a>
        <a href="#">Login</a>
      </div>
    </nav>
  );
}

export default Navbar;