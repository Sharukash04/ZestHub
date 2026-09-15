import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";

// Public Pages
import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";

// Restaurant Pages
import Restaurants from "./pages/Restaurants/Restaurants";

// Authentication Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";

// User Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddRestaurant from "./pages/Admin/AddRestaurant";
import EditRestaurant from "./pages/Admin/EditRestaurant";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

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


        {/* =========================
            AUTHENTICATION ROUTES
        ========================= */}

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


        {/* =========================
            USER ROUTES
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================
            ADMIN ROUTES
        ========================= */}

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