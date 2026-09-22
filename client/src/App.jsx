import { Routes, Route } from "react-router-dom";

// Main Pages
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";

// Authentication
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";

// Customer Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Favorites from "./pages/Profile/Favorites/Favorites";
import MyReviews from "./pages/Profile/MyReviews/MyReviews";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddRestaurant from "./pages/Admin/AddRestaurant";
import EditRestaurant from "./pages/Admin/EditRestaurant";

// Owner Pages
import OwnerDashboard from "./pages/Owner/OwnerDashboard";
import ManageMenu from "./pages/Owner/ManageMenu";

// Common Components
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* =========================
            PUBLIC PAGES
        ========================== */}

        <Route path="/" element={<Home />} />

        <Route
          path="/restaurants"
          element={<Restaurants />}
        />

        <Route
          path="/restaurant/:id"
          element={<RestaurantDetails />}
        />

        {/* =========================
            AUTHENTICATION
        ========================== */}

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
            CUSTOMER
        ========================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        <Route
          path="/reviews"
          element={<MyReviews />}
        />

        {/* =========================
            ADMIN
        ========================== */}

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

        {/* =========================
            RESTAURANT OWNER
        ========================== */}

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

        <Route
          path="/owner/restaurant/:restaurantId/menu"
          element={<ManageMenu />}
        />
      </Routes>
    </>
  );
}

export default App;