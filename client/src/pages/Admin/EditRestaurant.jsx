import API_URL from "../../config";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditRestaurant.css";

function EditRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load restaurant and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [restaurantResponse, categoriesResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/restaurants/${id}`
            ),
            fetch(
              "${API_URL}/api/categories/"
            ),
          ]);

        if (!restaurantResponse.ok) {
          throw new Error("Restaurant not found.");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to load categories.");
        }

        const restaurantData =
          await restaurantResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        setRestaurant(restaurantData);
        setCategories(categoriesData);

        setFormData({
          name: restaurantData.name || "",
          location: restaurantData.location || "",
          cuisine: restaurantData.cuisine || "",
          rating: restaurantData.average_rating ?? "",
          description: restaurantData.description || "",
          category_id: restaurantData.category_id || "",
        });

        // Existing image
        if (restaurantData.image) {
          if (
            restaurantData.image.startsWith("/uploads/")
          ) {
            setPreview(
              `${API_URL}${restaurantData.image}`
            );
          } else {
            setPreview(restaurantData.image);
          }
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Unable to load restaurant."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle normal fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Image validation
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

  // Remove newly selected image
  const removeNewImage = () => {
    setImage(null);

    // Restore existing image
    if (restaurant?.image) {
      if (restaurant.image.startsWith("/uploads/")) {
        setPreview(
          `${API_URL}${restaurant.image}`
        );
      } else {
        setPreview(restaurant.image);
      }
    } else {
      setPreview(null);
    }
  };

  // Submit update
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
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
        `${API_URL}/api/restaurants/${id}`,
        {
          method: "PUT",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to update restaurant."
        );
      }

      setMessage(
        "Restaurant updated successfully!"
      );

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="edit-restaurant-page">
        <div className="edit-loading">
          Loading restaurant...
        </div>
      </div>
    );
  }

  return (
    <div className="edit-restaurant-page">

      <div className="edit-restaurant-container">

        {/* Header */}
        <div className="edit-page-header">

          <button
            className="edit-back-button"
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1>Edit Restaurant</h1>

            <p>
              Update restaurant information and image.
            </p>
          </div>

        </div>

        {/* Form */}
        <form
          className="edit-restaurant-form"
          onSubmit={handleSubmit}
        >

          {/* Name */}
          <div className="edit-group">

            <label htmlFor="name">
              Restaurant Name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>

          {/* Location */}
          <div className="edit-group">

            <label htmlFor="location">
              Location
            </label>

            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />

          </div>

          {/* Cuisine */}
          <div className="edit-group">

            <label htmlFor="cuisine">
              Cuisine
            </label>

            <input
              type="text"
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              required
            />

          </div>

          {/* Rating */}
          <div className="edit-group">

            <label htmlFor="rating">
              Rating
            </label>

            <input
              type="number"
              id="rating"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              required
            />

          </div>

          {/* Category */}
          <div className="edit-group">

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
          <div className="edit-group full-width">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          {/* IMAGE */}
          <div className="edit-group full-width">

            <label>
              Restaurant Image
            </label>

            <div className="edit-image-upload">

              <input
                type="file"
                id="edit-restaurant-image"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
              />

              <label
                htmlFor="edit-restaurant-image"
                className={`edit-upload-box ${
                  isDragging ? "dragging" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                {preview ? (
                  <div className="edit-image-preview-wrapper">

                    <img
                      src={preview}
                      alt={formData.name}
                    />

                    <div className="edit-image-overlay">

                      <span>📷</span>

                      <strong>
                        Drag or Click to Change
                      </strong>

                    </div>

                  </div>
                ) : (
                  <>
                    <span className="edit-upload-icon">
                      📷
                    </span>

                    <strong>
                      Drag & Drop Restaurant Image
                    </strong>

                    <span className="edit-upload-or">
                      or
                    </span>

                    <span className="edit-browse-text">
                      Click to Browse
                    </span>

                    <small>
                      JPG • JPEG • PNG • WEBP • Max 5MB
                    </small>
                  </>
                )}

              </label>

              {image && (
                <button
                  type="button"
                  className="edit-remove-image-btn"
                  onClick={removeNewImage}
                >
                  ✕ Remove New Image
                </button>
              )}

            </div>

          </div>

          {/* Messages */}

          {message && (
            <div className="edit-success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="edit-error-message">
              {error}
            </div>
          )}

          {/* Buttons */}

          <div className="edit-form-actions">

            <button
              type="button"
              className="edit-cancel-button"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-submit-button"
              disabled={saving}
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditRestaurant;
