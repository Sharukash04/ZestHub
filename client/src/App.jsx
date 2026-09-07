import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import FeaturedRestaurants from "./components/FeaturedRestaurants/FeaturedRestaurants";
import TrendingRestaurants from "./components/TrendingRestaurants/TrendingRestaurants";

import Restaurants from "./pages/Restaurants/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddRestaurant from "./pages/Admin/AddRestaurant";
import EditRestaurant from "./pages/Admin/EditRestaurant";


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

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ================= RESTAURANTS ================= */}

        <Route
          path="/restaurants"
          element={<Restaurants />}
        />


        {/* ================= RESTAURANT DETAILS ================= */}

        <Route
          path="/restaurant/:id"
          element={<RestaurantDetails />}
        />


        {/* ================= ADMIN DASHBOARD ================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        {/* ================= ADD RESTAURANT ================= */}

        <Route
          path="/admin/restaurants/add"
          element={<AddRestaurant />}
        />


        {/* ================= EDIT RESTAURANT ================= */}

        <Route
          path="/admin/restaurants/edit/:id"
          element={<EditRestaurant />}
        />

      </Routes>
    </>
  );
}


export default App;