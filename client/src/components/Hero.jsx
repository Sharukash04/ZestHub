import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <h1>Find Your Perfect Meal</h1>

      <p>
        Discover the best restaurants and delicious food near you.
      </p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search restaurants..."
        />

        <button>Search</button>
      </div>
    </section>
  );
}

export default Hero;