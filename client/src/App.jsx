import { Routes, Route } from "react-router-dom";

import Hero from "./components/Hero/Hero";
import Categories from "./components/Categories";
import FeaturedRestaurants from "./components/FeaturedRestaurants/FeaturedRestaurants";
import TrendingRestaurants from "./components/TrendingRestaurants";
import WhyChooseUs from "./components/WhyChooseUs";
import CommunityPreview from "./components/CommunityPreview";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";

import "./pages/Home.css";

function Home() {
  return (
    <>
      <main className="home">
        <Hero />

        <Categories />

        <FeaturedRestaurants />

        <TrendingRestaurants />

        <WhyChooseUs />

        <CommunityPreview />

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

function RestaurantPage() {
  return (
    <>
      <Restaurants />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Routes>

      {/* Home */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* Restaurants */}
      <Route
        path="/restaurants"
        element={<RestaurantPage />}
      />

      {/* Restaurant Details */}
      <Route
        path="/restaurant/:id"
        element={<RestaurantDetails />}
      />

    </Routes>
  );
}

export default App;