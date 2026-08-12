import "./FeaturedRestaurants.css";

import restaurant1 from "../../assets/images/restaurant1.jpg";
import restaurant2 from "../../assets/images/restaurant2.jpg";
import restaurant3 from "../../assets/images/restaurant3.jpg";

import { useNavigate } from "react-router-dom";

function FeaturedRestaurants() {
  const navigate = useNavigate();

  const restaurants = [
    {
      id: 1,
      name: "Spice Garden",
      image: restaurant1,
      rating: "4.8",
      location: "Trichy",
      cuisine: "South Indian",
    },
    {
      id: 2,
      name: "Urban Cafe",
      image: restaurant2,
      rating: "4.6",
      location: "Chennai",
      cuisine: "Cafe & Beverages",
    },
    {
      id: 3,
      name: "Royal Biryani House",
      image: restaurant3,
      rating: "4.9",
      location: "Madurai",
      cuisine: "Biryani",
    },
  ];

  return (
    <section className="featured">

      <div className="featured-header">
        <h2>Featured Restaurants</h2>

        <p>
          Discover popular restaurants loved by food enthusiasts
        </p>
      </div>

      <div className="restaurant-container">

        {restaurants.map((restaurant) => (
          <div
            className="restaurant-card"
            key={restaurant.id}
          >

            <img
              src={restaurant.image}
              alt={restaurant.name}
            />

            <div className="restaurant-info">

              <h3>{restaurant.name}</h3>

              <div className="rating">
                ⭐ {restaurant.rating}
              </div>

              <p>
                📍 {restaurant.location}
              </p>

              <p>
                🍽️ {restaurant.cuisine}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/restaurant/${restaurant.id}`)
                }
              >
                View Details
              </button>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default FeaturedRestaurants;