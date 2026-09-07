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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =====================================================
     LOAD RESTAURANT + CATEGORIES
     ===================================================== */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [restaurantResponse, categoryResponse] =
          await Promise.all([
            fetch(
              `http://127.0.0.1:8000/api/restaurants/${id}`
            ),
            fetch(
              "http://127.0.0.1:8000/api/categories/"
            ),
          ]);

        if (!restaurantResponse.ok) {
          throw new Error("Restaurant not found");
        }

        if (!categoryResponse.ok) {
          throw new Error("Failed to load categories");
        }

        const restaurantData =
          await restaurantResponse.json();

        const categoryData =
          await categoryResponse.json();

        setRestaurant(restaurantData);
        setCategories(categoryData);

        setFormData({
          name: restaurantData.name || "",
          location: restaurantData.location || "",
          cuisine: restaurantData.cuisine || "",
          rating: restaurantData.rating ?? "",
          description: restaurantData.description || "",
          category_id:
            restaurantData.category_id || "",
        });

        /* Existing image */

        if (restaurantData.image) {
          if (
            restaurantData.image.startsWith("/uploads/")
          ) {
            setPreview(
              `http://127.0.0.1:8000${restaurantData.image}`
            );
          } else {
            setPreview(restaurantData.image);
          }
        }

      } catch (error) {
        console.error("Edit restaurant error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);


  /* =====================================================
     INPUT CHANGE
     ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     IMAGE CHANGE
     ===================================================== */

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (!selectedImage) {
      return;
    }

    setImage(selectedImage);

    setPreview(
      URL.createObjectURL(selectedImage)
    );
  };


  /* =====================================================
     UPDATE RESTAURANT
     ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("cuisine", formData.cuisine);
      data.append("rating", formData.rating);
      data.append("description", formData.description);
      data.append("category_id", formData.category_id);

      /* Only send image if user selected a new one */

      if (image) {
        data.append("image", image);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/restaurants/${id}`,
        {
          method: "PUT",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to update restaurant"
        );
      }

      setMessage(
        "Restaurant updated successfully! ✅"
      );

      setTimeout(() => {
        navigate("/admin");
      }, 1000);

    } catch (error) {
      console.error("Update error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="edit-page">
        <div className="edit-loading">
          Loading restaurant...
        </div>
      </div>
    );
  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error && !restaurant) {
    return (
      <div className="edit-page">
        <div className="edit-error">

          <h2>Unable to load restaurant</h2>

          <p>{error}</p>

          <button
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>

        </div>
      </div>
    );
  }


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="edit-page">

      <div className="edit-container">

        {/* Header */}

        <div className="edit-header">

          <div>

            <p className="edit-label">
              ZESTHUB ADMIN
            </p>

            <h1>Edit Restaurant</h1>

            <p>
              Update the restaurant information.
            </p>

          </div>

          <button
            className="edit-back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>

        </div>


        {/* Form */}

        <form
          className="edit-form"
          onSubmit={handleSubmit}
        >

          <div className="edit-grid">

            {/* Restaurant Name */}

            <div className="edit-group full-width">

              <label>
                Restaurant Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* Location */}

            <div className="edit-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>


            {/* Cuisine */}

            <div className="edit-group">

              <label>
                Cuisine
              </label>

              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                required
              />

            </div>


            {/* Category */}

            <div className="edit-group">

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

            <div className="edit-group">

              <label>
                Rating
              </label>

              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />

            </div>


            {/* Description */}

            <div className="edit-group full-width">

              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
              />

            </div>


            {/* Image */}

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
                  className="edit-upload-box"
                >

                  {preview ? (
                    <img
                      src={preview}
                      alt={formData.name}
                    />
                  ) : (
                    <>
                      <span>
                        📷
                      </span>

                      <strong>
                        Choose New Image
                      </strong>

                      <small>
                        JPG, JPEG, PNG or WEBP
                      </small>
                    </>
                  )}

                </label>

              </div>

              {image && (
                <p className="new-image-text">
                  New image selected: {image.name}
                </p>
              )}

            </div>

          </div>


          {/* Messages */}

          {message && (
            <div className="edit-success">
              {message}
            </div>
          )}

          {error && (
            <div className="edit-error-message">
              {error}
            </div>
          )}


          {/* Actions */}

          <div className="edit-actions">

            <button
              type="button"
              className="edit-cancel-btn"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditRestaurant;