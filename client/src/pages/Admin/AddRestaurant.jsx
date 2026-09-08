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

  // Load categories
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories/")
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

  // Handle normal form inputs
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Validate and select image
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
      setError("Please upload JPG, JPEG, PNG or WEBP image.");
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

  // Normal file selection
  const handleImageChange = (event) => {
    handleImageSelect(event.target.files[0]);
  };

  // Drag over
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // Drag leave
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Drop image
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    handleImageSelect(droppedFile);
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  // Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("cuisine", formData.cuisine);
      data.append("rating", formData.rating);
      data.append("description", formData.description);
      data.append("category_id", formData.category_id);

      if (image) {
        data.append("image", image);
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/restaurants/",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to add restaurant."
        );
      }

      setMessage("Restaurant added successfully!");

      // Go back to admin dashboard
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-restaurant-page">
      <div className="add-restaurant-container">

        {/* Header */}
        <div className="add-page-header">
          <button
            className="back-button"
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1>Add Restaurant</h1>
            <p>
              Add a new restaurant to the ZestHub platform.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          className="add-restaurant-form"
          onSubmit={handleSubmit}
        >

          {/* Restaurant Name */}
          <div className="form-group">
            <label htmlFor="name">
              Restaurant Name
            </label>

            <input
              type="text"
              id="name"
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
              type="text"
              id="location"
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
              type="text"
              id="cuisine"
              name="cuisine"
              placeholder="Example: South Indian, Chinese"
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
              type="number"
              id="rating"
              name="rating"
              placeholder="Example: 4.5"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              required
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
              required
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
          <div className="form-group full-width">
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

          {/* IMAGE UPLOAD */}
          <div className="form-group full-width">
            <label>
              Restaurant Image
            </label>

            <div className="image-upload">

              <input
                type="file"
                id="restaurant-image"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
              />

              <label
                htmlFor="restaurant-image"
                className={`upload-box ${
                  isDragging ? "dragging" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                {preview ? (
                  <div className="image-preview-wrapper">

                    <img
                      src={preview}
                      alt="Restaurant preview"
                    />

                    <div className="image-overlay">
                      <span>📷</span>
                      <strong>
                        Drag or Click to Change
                      </strong>
                    </div>

                  </div>
                ) : (
                  <>
                    <span className="upload-icon">
                      📷
                    </span>

                    <strong>
                      Drag & Drop Restaurant Image
                    </strong>

                    <span className="upload-or">
                      or
                    </span>

                    <span className="browse-text">
                      Click to Browse
                    </span>

                    <small>
                      JPG • JPEG • PNG • WEBP • Max 5MB
                    </small>
                  </>
                )}

              </label>

              {preview && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                >
                  ✕ Remove Image
                </button>
              )}

            </div>
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

          {/* Buttons */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/admin")}
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