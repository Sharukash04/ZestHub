import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import FeaturedRestaurants from "./components/FeaturedRestaurants/FeaturedRestaurants";
import TrendingRestaurants from "./components/TrendingRestaurants/TrendingRestaurants";

import Restaurants from "./pages/Restaurants/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";

function Home() {
  return (
    <>
      <Hero />
      <FeaturedRestaurants />
      <TrendingRestaurants />
    </>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      </Routes>
    </>
  );
}

export default App;