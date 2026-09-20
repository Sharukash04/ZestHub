import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import Restaurants from "./pages/Restaurants/Restaurants";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";

import Dashboard from "./pages/Dashboard/Dashboard";

import Profile from "./pages/Profile/Profile";
import MyReviews from "./pages/Profile/MyReviews/MyReviews";
import Favorites from "./pages/Profile/Favorites/Favorites";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddRestaurant from "./pages/Admin/AddRestaurant";
import EditRestaurant from "./pages/Admin/EditRestaurant";

import OwnerDashboard from "./pages/Owner/OwnerDashboard";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* ================================
            PUBLIC PAGES
        ================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/restaurants"
          element={<Restaurants />}
        />

        <Route
          path="/restaurant/:id"
          element={<RestaurantDetails />}
        />


        {/* ================================
            AUTHENTICATION
        ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />


        {/* ================================
            CUSTOMER
        ================================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/profile/reviews"
          element={<MyReviews />}
        />

        <Route
          path="/profile/favorites"
          element={<Favorites />}
        />


        {/* ================================
            RESTAURANT OWNER
        ================================= */}

        <Route
          path="/owner"
          element={<OwnerDashboard />}
        />

        <Route
          path="/owner/add-restaurant"
          element={<AddRestaurant />}
        />

        <Route
          path="/owner/edit-restaurant/:id"
          element={<EditRestaurant />}
        />


        {/* ================================
            ADMIN
        ================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/add-restaurant"
          element={<AddRestaurant />}
        />

        <Route
          path="/admin/edit-restaurant/:id"
          element={<EditRestaurant />}
        />

      </Routes>
    </>
  );
}

export default App;