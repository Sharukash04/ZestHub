import "./Restaurants.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/restaurants/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        return response.json();
      })
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load restaurants");
        setLoading(false);
      });
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchText = search.toLowerCase();

    return (
      restaurant.name?.toLowerCase().includes(searchText) ||
      restaurant.cuisine?.toLowerCase().includes(searchText) ||
      restaurant.location?.toLowerCase().includes(searchText)
    );
  });

  return (
    <section className="restaurants-page">

      <div className="restaurants-header">
        <h1>Discover Restaurants</h1>

        <p>
          Find the best places to eat, explore and share your experience.
        </p>
      </div>

      <div className="restaurant-search">
        <input
          type="text"
          placeholder="Search restaurants, cuisines or locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button>
          Search
        </button>
      </div>

      <div className="restaurant-filters">
        <button>All</button>
        <button>Top Rated</button>
        <button>Most Reviewed</button>
        <button>Trending</button>
      </div>

      {loading && (
        <p className="restaurant-message">
          Loading restaurants...
        </p>
      )}

      {error && (
        <p className="restaurant-message error">
          {error}
        </p>
      )}

      {!loading && !error && filteredRestaurants.length === 0 && (
        <p className="restaurant-message">
          No restaurants found.
        </p>
      )}

      <div className="restaurants-grid">

        {filteredRestaurants.map((restaurant) => (

          <div className="listing-card" key={restaurant.id}>

            <div className="listing-image">
              🍽️
            </div>

            <div className="listing-info">

              <h2>{restaurant.name}</h2>

              <div className="listing-rating">
                ⭐ {restaurant.rating}
              </div>

              <p>
                📍 {restaurant.location}
              </p>

              <p>
                🍴 {restaurant.cuisine}
              </p>

              <button
                className="details-button"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
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

export default Restaurants;