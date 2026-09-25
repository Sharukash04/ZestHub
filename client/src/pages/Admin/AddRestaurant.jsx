import API_URL from "../../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRestaurant.css";

function AddRestaurant() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    cuisine: "",
    rating: "",
    description: "",
    category_id: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // LOAD CATEGORIES
  // ---------------------------------------------------------

  useEffect(() => {
    fetch(`${API_URL}/api/categories/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        return response.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load categories.");
      });
  }, []);

  // ---------------------------------------------------------
  // HANDLE FORM INPUTS
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // IMAGE VALIDATION
  // ---------------------------------------------------------

  const handleImageSelect = (selectedImage) => {
    if (!selectedImage) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedImage.type)) {
      setError(
        "Please upload JPG, JPEG, PNG or WEBP image."
      );
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setImage(selectedImage);

    const imageUrl = URL.createObjectURL(selectedImage);
    setPreview(imageUrl);

    setError("");
    setMessage("");
  };

  // ---------------------------------------------------------
  // NORMAL FILE SELECTION
  // ---------------------------------------------------------

  const handleImageChange = (event) => {
    handleImageSelect(event.target.files[0]);
  };

  // ---------------------------------------------------------
  // DRAG OVER
  // ---------------------------------------------------------

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // ---------------------------------------------------------
  // DRAG LEAVE
  // ---------------------------------------------------------

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // ---------------------------------------------------------
  // DROP IMAGE
  // ---------------------------------------------------------

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    handleImageSelect(droppedFile);
  };

  // ---------------------------------------------------------
  // REMOVE IMAGE
  // ---------------------------------------------------------

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  // ---------------------------------------------------------
  // SUBMIT FORM
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Get authentication token
      const token = localStorage.getItem("zesthub_token");

      if (!token) {
        throw new Error(
          "Not authenticated. Please login again."
        );
      }

      // Get current user
      const currentUser = JSON.parse(
        localStorage.getItem("zesthub_user")
      );

      if (!currentUser) {
        throw new Error(
          "User information not found. Please login again."
        );
      }

      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("location", formData.location.trim());
      data.append("cuisine", formData.cuisine.trim());
      data.append("rating", formData.rating || "0");
      data.append(
        "description",
        formData.description.trim()
      );

      // Only send category_id when selected
      if (formData.category_id) {
        data.append(
          "category_id",
          formData.category_id
        );
      }

      // Send image
      if (image) {
        data.append("image", image);
      }

      // Send authenticated request
      const response = await fetch(
        `${API_URL}/api/restaurants/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Failed to add restaurant."
        );
      }

      setMessage(
        "Restaurant added successfully! 🎉"
      );

      // Role-based redirect
      setTimeout(() => {
        if (currentUser.role === "owner") {
          navigate("/owner");
        } else if (currentUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1000);

    } catch (err) {
      console.error("Add restaurant error:", err);

      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // BACK NAVIGATION
  // ---------------------------------------------------------

  const handleBack = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("zesthub_user")
    );

    if (currentUser?.role === "owner") {
      navigate("/owner");
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="add-restaurant-page">

      <div className="add-restaurant-container">

        {/* Header */}
        <div className="add-page-header">

          <button
            className="back-button"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </button>

          <h1>
            Add Restaurant
          </h1>

          <p>
            Add a new restaurant to the ZestHub platform.
          </p>

        </div>

        {/* Messages */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Form */}

        <form
          className="restaurant-form"
          onSubmit={handleSubmit}
        >

          {/* Restaurant Name */}

          <div className="form-group">

            <label htmlFor="name">
              Restaurant Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter restaurant name"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>

          {/* Location */}

          <div className="form-group">

            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              type="text"
              name="location"
              placeholder="Enter restaurant location"
              value={formData.location}
              onChange={handleChange}
              required
            />

          </div>

          {/* Cuisine */}

          <div className="form-group">

            <label htmlFor="cuisine">
              Cuisine
            </label>

            <input
              id="cuisine"
              type="text"
              name="cuisine"
              placeholder="Example: South Indian"
              value={formData.cuisine}
              onChange={handleChange}
              required
            />

          </div>

          {/* Rating */}

          <div className="form-group">

            <label htmlFor="rating">
              Rating
            </label>

            <input
              id="rating"
              type="number"
              name="rating"
              placeholder="Enter rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
            />

          </div>

          {/* Category */}

          <div className="form-group">

            <label htmlFor="category_id">
              Category
            </label>

            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >

              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

          </div>

          {/* Description */}

          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Enter restaurant description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />

          </div>

          {/* Image Upload */}

          <div className="form-group">

            <label>
              Restaurant Image
            </label>

            <div
              className={`image-upload-area ${
                isDragging
                  ? "dragging"
                  : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >

              {preview ? (

                <div className="image-preview-container">

                  <img
                    src={preview}
                    alt="Restaurant preview"
                    className="restaurant-preview"
                  />

                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={removeImage}
                  >
                    ✕ Remove Image
                  </button>

                </div>

              ) : (

                <label
                  htmlFor="restaurant-image"
                  className="image-upload-label"
                >
                  <div className="upload-icon">
                    📷
                  </div>

                  <p>
                    Drag or Click to Change
                  </p>

                  <span>
                    JPG, JPEG, PNG or WEBP
                  </span>

                </label>

              )}

              <input
                id="restaurant-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                hidden
              />

            </div>

          </div>

          {/* Buttons */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={handleBack}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? "Adding Restaurant..."
                : "Add Restaurant"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddRestaurant;
