import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

import biryani from "../../assets/images/biryani.jpg";
import burger from "../../assets/images/burger.jpg";
import cafe from "../../assets/images/cafe.jpg";
import desserts from "../../assets/images/desserts.jpg";
import heroFood from "../../assets/images/hero-food.jpg";
import keralaFoodCourt from "../../assets/images/Kerala Food Court.jpg";
import pizza from "../../assets/images/pizza.jpg";
import restaurant1 from "../../assets/images/restaurant1.jpg";
import restaurant2 from "../../assets/images/restaurant2.jpg";
import restaurant3 from "../../assets/images/restaurant3.jpg";

const API_URL = "http://127.0.0.1:8000";

/*
  Existing frontend images.

  These are used for old restaurant records whose database
  image value is only a filename.
*/
const imageMap = {
  "chinese-wok.jpg": restaurant1,
  "gorets-cafe.jpg": cafe,
  "cascade-cafe.jpg": restaurant2,
  "grill-chicken.jpg": restaurant3,

  "biryani.jpg": biryani,
  "burger.jpg": burger,
  "cafe.jpg": cafe,
  "desserts.jpg": desserts,
  "hero-food.jpg": heroFood,
  "Kerala Food Court.jpg": keralaFoodCourt,
  "pizza.jpg": pizza,
  "restaurant1.jpg": restaurant1,
  "restaurant2.jpg": restaurant2,
  "restaurant3.jpg": restaurant3,
};


/*
  Converts the image value coming from PostgreSQL
  into a usable browser URL.
*/
const getRestaurantImage = (image) => {
  if (!image) {
    return heroFood;
  }

  // Uploaded image from FastAPI
  if (image.startsWith("/uploads/")) {
    return `${API_URL}${image}`;
  }

  // Existing React image
  if (imageMap[image]) {
    return imageMap[image];
  }

  // Fallback
  return heroFood;
};


function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("zesthub_token");
    const storedUser = localStorage.getItem("zesthub_user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to read stored user:", error);
      }
    }

    fetchRestaurants(token);
  }, [navigate]);


  const fetchRestaurants = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/restaurants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRestaurants(response.data);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    } finally {
      setLoading(false);
    }
  };


  const getRating = (restaurant) => {
    const rating = Number(restaurant.rating);

    if (!rating || rating <= 0) {
      return "New";
    }

    return rating.toFixed(1);
  };


  /*
    Most popular restaurants
    sorted by rating.
  */
  const popularRestaurants = [...restaurants]
    .sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    )
    .slice(0, 4);


  /*
    Current nearby section.

    Location-based filtering will be added later.
  */
  const nearbyRestaurants = restaurants.slice(0, 4);


  /*
    Basic recommendation for now.

    Our actual AI recommendation system
    will replace this later.
  */
  const recommendedRestaurants = restaurants
    .filter(
      (restaurant) =>
        Number(restaurant.rating || 0) >= 4.0
    )
    .slice(0, 4);


  const handleRestaurantClick = (id) => {
    navigate(`/restaurant/${id}`);
  };


  return (
    <div className="dashboard">

      {/* =========================
          HERO
      ========================= */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <span className="dashboard-welcome">
            🍽️ Welcome to ZestHub
          </span>

          <h1>
            Discover your next
            <span> favorite restaurant.</span>
          </h1>

          <p>
            Find amazing food, explore restaurants around you,
            and discover places recommended just for you.
          </p>

          <div className="dashboard-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search restaurants, cuisines or dishes..."
            />

            <button>
              Search
            </button>

          </div>

        </div>

      </section>


      {/* =========================
          USER GREETING
      ========================= */}

      <section className="dashboard-container">

        <div className="user-greeting">

          <div>

            <span className="section-label">
              YOUR ZESTHUB
            </span>

            <h2>
              Hey {user?.name || "Foodie"} 👋
            </h2>

            <p>
              Let's find something delicious today.
            </p>

          </div>

          <button
            className="profile-button"
            onClick={() => navigate("/profile")}
          >
            👤 My Profile
          </button>

        </div>


        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <div className="quick-actions">

          <div className="quick-card">

            <div className="quick-icon">
              📍
            </div>

            <div>
              <h3>Nearby</h3>
              <p>Restaurants around you</p>
            </div>

          </div>


          <div className="quick-card">

            <div className="quick-icon">
              🔥
            </div>

            <div>
              <h3>Popular</h3>
              <p>Top restaurants in your city</p>
            </div>

          </div>


          <div className="quick-card">

            <div className="quick-icon">
              ✨
            </div>

            <div>
              <h3>For You</h3>
              <p>Personalized recommendations</p>
            </div>

          </div>


          <div className="quick-card">

            <div className="quick-icon">
              ❤️
            </div>

            <div>
              <h3>Favorites</h3>
              <p>Your saved restaurants</p>
            </div>

          </div>

        </div>


        {/* =========================
            NEARBY RESTAURANTS
        ========================= */}

        <section className="restaurant-section">

          <div className="section-header">

            <div>

              <span className="section-label">
                DISCOVER
              </span>

              <h2>
                📍 Restaurants Around You
              </h2>

              <p>
                Explore restaurants available on ZestHub.
              </p>

            </div>

            <button
              onClick={() => navigate("/restaurants")}
            >
              View All →
            </button>

          </div>


          {loading ? (

            <div className="loading-message">
              Loading restaurants...
            </div>

          ) : nearbyRestaurants.length === 0 ? (

            <div className="empty-message">
              No restaurants available yet.
            </div>

          ) : (

            <div className="restaurant-grid">

              {nearbyRestaurants.map((restaurant) => (

                <div
                  className="dashboard-restaurant-card"
                  key={restaurant.id}
                  onClick={() =>
                    handleRestaurantClick(restaurant.id)
                  }
                >

                  <div className="restaurant-image-wrapper">

                    <img
                      src={getRestaurantImage(
                        restaurant.image
                      )}
                      alt={restaurant.name}
                      onError={(event) => {
                        event.currentTarget.src = heroFood;
                      }}
                    />

                    <span className="rating-badge">
                      ⭐ {getRating(restaurant)}
                    </span>

                  </div>


                  <div className="restaurant-card-content">

                    <h3>
                      {restaurant.name}
                    </h3>

                    <p className="restaurant-category">
                      {restaurant.cuisine ||
                        restaurant.category ||
                        "Restaurant"}
                    </p>

                    <p className="restaurant-location">
                      📍 {restaurant.location || "Trichy"}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* =========================
            POPULAR
        ========================= */}

        <section className="restaurant-section">

          <div className="section-header">

            <div>

              <span className="section-label">
                TRENDING NOW
              </span>

              <h2>
                🔥 Most Popular
              </h2>

              <p>
                Highly rated restaurants loved by foodies.
              </p>

            </div>

          </div>


          <div className="restaurant-grid">

            {popularRestaurants.map((restaurant) => (

              <div
                className="dashboard-restaurant-card"
                key={restaurant.id}
                onClick={() =>
                  handleRestaurantClick(restaurant.id)
                }
              >

                <div className="restaurant-image-wrapper">

                  <img
                    src={getRestaurantImage(
                      restaurant.image
                    )}
                    alt={restaurant.name}
                    onError={(event) => {
                      event.currentTarget.src = heroFood;
                    }}
                  />

                  <span className="rating-badge">
                    ⭐ {getRating(restaurant)}
                  </span>

                </div>


                <div className="restaurant-card-content">

                  <h3>
                    {restaurant.name}
                  </h3>

                  <p className="restaurant-category">
                    {restaurant.cuisine ||
                      restaurant.category ||
                      "Restaurant"}
                  </p>

                  <p className="restaurant-location">
                    📍 {restaurant.location || "Trichy"}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =========================
            RECOMMENDED
        ========================= */}

        <section className="recommended-section">

          <div className="recommended-content">

            <span className="section-label">
              ZESTHUB SMART
            </span>

            <h2>
              ✨ Recommended For You
            </h2>

            <p>
              ZestHub will learn your preferences, ratings,
              favorite cuisines and activity to provide
              personalized restaurant recommendations.
            </p>

            <button
              onClick={() => navigate("/restaurants")}
            >
              Explore Restaurants →
            </button>

          </div>


          <div className="recommended-icon">
            🤖
          </div>

        </section>


        {/* =========================
            COMMUNITY
        ========================= */}

        <section className="community-section">

          <div>

            <span className="section-label">
              ZESTHUB COMMUNITY
            </span>

            <h2>
              👥 Share. Review. Discover.
            </h2>

            <p>
              See what other food lovers are saying,
              share your restaurant experiences and help
              the community discover great places.
            </p>

          </div>


          <button
            onClick={() => navigate("/restaurants")}
          >
            Explore Community →
          </button>

        </section>

      </section>

    </div>
  );
}

export default Dashboard;