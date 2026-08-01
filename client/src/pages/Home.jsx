function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff8f3",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#ff6b35", fontSize: "48px" }}>🍽️ ZestHub</h1>

        <h2>Find Your Perfect Meal</h2>

        <p style={{ maxWidth: "600px", margin: "20px auto" }}>
          Discover restaurants, browse menus, read reviews, and explore amazing
          food around you.
        </p>

        <input
          type="text"
          placeholder="Search restaurants..."
          style={{
            padding: "12px",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <br />
        <br />

        <button
          style={{
            padding: "12px 24px",
            background: "#ff6b35",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Explore Restaurants
        </button>
      </div>
    </main>
  );
}

export default Home;