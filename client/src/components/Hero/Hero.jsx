import "./Hero.css";
import heroImage from "../../assets/images/hero-food.jpg";
import { FaSearch, FaStar, FaMapMarkerAlt, FaStore } from "react-icons/fa";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <span className="hero-badge">
          🍽️ Restaurant Discovery Platform
        </span>

        <h1>
          Discover Your Perfect
          <span> Dining Experience</span>
        </h1>

        <p>
          Explore restaurants, cafés, and hidden food gems.
          Read trusted reviews and discover places you'll love.
        </p>


        <div className="search-container">

          <input
            type="text"
            placeholder="Search restaurants, cuisines or locations..."
          />

          <button>
            <FaSearch />
          </button>

        </div>


        <button className="explore-btn">
          Start Exploring
        </button>


        <div className="stats">

          <div>
            <FaStore />
            <h3>500+</h3>
            <p>Restaurants</p>
          </div>


          <div>
            <FaStar />
            <h3>15K+</h3>
            <p>Reviews</p>
          </div>


          <div>
            <FaMapMarkerAlt />
            <h3>20+</h3>
            <p>Cities</p>
          </div>

        </div>


      </div>


      <div className="hero-image">

        <img
          src={heroImage}
          alt="Restaurant food"
        />

      </div>


    </section>
  );
}

export default Hero;