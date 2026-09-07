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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Get categories
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
      .catch((error) => {
        console.error("Category error:", error);
        setError("Unable to load categories.");
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (!selectedImage) {
      return;
    }

    setImage(selectedImage);
    setPreview(URL.createObjectURL(selectedImage));
  };

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
          result.detail || "Failed to add restaurant"
        );
      }

      setMessage("Restaurant added successfully! 🍽️");

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      console.error("Add restaurant error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">

      <div className="admin-form-container">

        {/* Header */}

        <div className="form-header">

          <div>
            <p className="form-label">
              ZESTHUB ADMIN
            </p>

            <h1>Add Restaurant</h1>

            <p>
              Add a new restaurant to ZestHub.
            </p>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>

        </div>

        {/* Form */}

        <form
          className="restaurant-form"
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* Restaurant Name */}

            <div className="form-group full-width">

              <label>
                Restaurant Name
              </label>

              <input
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

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="Example: Thillai Nagar, Trichy"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>

            {/* Cuisine */}

            <div className="form-group">

              <label>
                Cuisine
              </label>

              <input
                type="text"
                name="cuisine"
                placeholder="Example: South Indian, Biryani"
                value={formData.cuisine}
                onChange={handleChange}
                required
              />

            </div>

            {/* Category */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
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

            {/* Rating */}

            <div className="form-group">

              <label>
                Rating
              </label>

              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                placeholder="Example: 4.5"
                value={formData.rating}
                onChange={handleChange}
              />

            </div>

            {/* Description */}

            <div className="form-group full-width">

              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="5"
                placeholder="Enter restaurant description"
                value={formData.description}
                onChange={handleChange}
              />

            </div>

            {/* Image */}

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
                  className="upload-box"
                >

                  {preview ? (
                    <img
                      src={preview}
                      alt="Restaurant preview"
                    />
                  ) : (
                    <>
                      <span className="upload-icon">
                        📷
                      </span>

                      <strong>
                        Choose Restaurant Image
                      </strong>

                      <small>
                        JPG, JPEG, PNG or WEBP
                      </small>
                    </>
                  )}

                </label>

              </div>

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
              className="cancel-btn"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading
                ? "Adding..."
                : "Add Restaurant"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddRestaurant;