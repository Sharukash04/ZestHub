import "./Hero.css";
import { FaSearch } from "react-icons/fa";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <h1>
          Discover the Best Restaurants Near You
        </h1>

        <p>
          Explore delicious food, discover hidden gems,
          and enjoy unforgettable dining experiences with ZestHub.
        </p>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
          />

          <button>
            <FaSearch />
          </button>

        </div>

        <button className="discover-btn">
          Discover Restaurants
        </button>

      </div>

      <div className="hero-image">

        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700"
          alt="Restaurant"
        />

      </div>

    </section>
  );
}

export default Hero;