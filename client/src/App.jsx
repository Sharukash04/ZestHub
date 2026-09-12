import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import FeaturedRestaurants from "./components/FeaturedRestaurants/FeaturedRestaurants";
import TrendingRestaurants from "./components/TrendingRestaurants/TrendingRestaurants";

// Restaurant Pages
import Restaurants from "./pages/Restaurants/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";

// Authentication Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";

// Dashboard
import Dashboard from "./pages/Dashboard/Dashboard";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddRestaurant from "./pages/Admin/AddRestaurant";
import EditRestaurant from "./pages/Admin/EditRestaurant";


// Public Home Page
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

        {/* =========================
            PUBLIC HOME
        ========================= */}
        <Route path="/" element={<Home />} />


        {/* =========================
            AUTHENTICATION
        ========================= */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />


        {/* =========================
            USER DASHBOARD
        ========================= */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================
            RESTAURANTS
        ========================= */}
        <Route
          path="/restaurants"
          element={<Restaurants />}
        />

        <Route
          path="/restaurant/:id"
          element={<RestaurantDetails />}
        />


        {/* =========================
            ADMIN
        ========================= */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/restaurants/add"
          element={<AddRestaurant />}
        />

        <Route
          path="/admin/restaurants/edit/:id"
          element={<EditRestaurant />}
        />

      </Routes>
    </>
  );
}

export default App;