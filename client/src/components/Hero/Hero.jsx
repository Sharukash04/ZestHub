import "./Hero.css";
import heroFood from "../../assets/images/hero-food.jpg";
import { FaSearch, FaMapMarkerAlt, FaStar, FaUtensils } from "react-icons/fa";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <span className="hero-tag">
          🍽️ Discover Amazing Food
        </span>

        <h1>
          Discover Your Next
          <span> Favorite Meal</span>
        </h1>

        <p>
          Explore top-rated restaurants, cafés, and hidden food gems.
          Read trusted reviews and find your perfect dining experience
          with ZestHub.
        </p>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
          />

          <button>
            <FaSearch />
          </button>

        </div>

        <div className="hero-buttons">

          <button className="primary-btn">
            Explore Restaurants
          </button>

          <button className="secondary-btn">
            Learn More
          </button>

        </div>

        <div className="hero-stats">

          <div className="stat">
            <FaUtensils />
            <div>
              <h3>500+</h3>
              <p>Restaurants</p>
            </div>
          </div>

          <div className="stat">
            <FaStar />
            <div>
              <h3>10K+</h3>
              <p>Reviews</p>
            </div>
          </div>

          <div className="stat">
            <FaMapMarkerAlt />
            <div>
              <h3>20+</h3>
              <p>Locations</p>
            </div>
          </div>

        </div>

      </div>

      <div className="hero-image">

        <img
          src={heroFood}
          alt="Delicious Food"
        />

      </div>

    </section>
  );
}

export default Hero;