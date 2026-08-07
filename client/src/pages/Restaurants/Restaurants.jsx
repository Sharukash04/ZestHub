import "./Restaurants.css";

function Restaurants() {
  const restaurants = [
    {
      name: "Spice Garden",
      rating: "4.8",
      reviews: "2.4K",
      location: "Trichy",
      cuisine: "South Indian",
    },
    {
      name: "Royal Biryani House",
      rating: "4.9",
      reviews: "3.1K",
      location: "Trichy",
      cuisine: "Biryani",
    },
    {
      name: "Urban Cafe",
      rating: "4.6",
      reviews: "1.8K",
      location: "Trichy",
      cuisine: "Cafe & Beverages",
    },
    {
      name: "Burger Point",
      rating: "4.5",
      reviews: "1.5K",
      location: "Trichy",
      cuisine: "Fast Food",
    },
  ];

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

      <div className="restaurants-grid">

        {restaurants.map((restaurant, index) => (

          <div className="listing-card" key={index}>

            <div className="listing-image">
              🍽️
            </div>

            <div className="listing-info">

              <h2>{restaurant.name}</h2>

              <div className="listing-rating">
                ⭐ {restaurant.rating}
              </div>

              <p>
                💬 {restaurant.reviews} Reviews
              </p>

              <p>
                📍 {restaurant.location}
              </p>

              <p>
                🍴 {restaurant.cuisine}
              </p>

              <button className="details-button">
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