import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ManageMenu.css";

const API_URL = "http://127.0.0.1:8000";

function ManageMenu() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const fileInputRef = useRef(null);

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    is_available: true,
  });

  useEffect(() => {
    const loadRestaurantAndMenu = async () => {
      try {
            setLoading(true);
            setError("");

            const restaurantResponse = await fetch(
              `${API_URL}/api/restaurants/${restaurantId}`
            );

            if (!restaurantResponse.ok) {
              throw new Error("Restaurant not found");
            }

            const restaurantData = await restaurantResponse.json();

            const menuResponse = await fetch(
              `${API_URL}/api/menu-items/restaurant/${restaurantId}`
            );

            if (!menuResponse.ok) {
              throw new Error("Unable to load menu items");
            }

            const menuData = await menuResponse.json();

            const storedUser =
              localStorage.getItem("zesthub_user");

            const currentUser = JSON.parse(storedUser);

            if (
              currentUser.role === "owner" &&
              Number(restaurantData.owner_id) !==
                Number(currentUser.id)
            ) {
              setError(
                "You are not allowed to manage this restaurant."
              );
              return;
            }

            setRestaurant(restaurantData);

            setMenuItems(
              Array.isArray(menuData) ? menuData : []
            );
          } catch (err) {
            console.error("Menu loading error:", err);

            setError(
              err.message || "Unable to load menu."
            );
          } finally {
            setLoading(false);
          }
    };

    loadRestaurantAndMenu();

  }, [navigate, restaurantId]);

  // ============================================================
  // LOAD RESTAURANT + MENU
  // ============================================================


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ============================================================
  // IMAGE VALIDATION
  // ============================================================

  const validateImage = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must not exceed 5 MB."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // IMAGE SELECT
  // ============================================================

  const handleImageSelect = (file) => {
    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (!validateImage(file)) {
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    // Clear URL when uploading a local file.
    setFormData((previous) => ({
      ...previous,
      imageUrl: "",
    }));
  };

  // ============================================================
  // FILE INPUT
  // ============================================================

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleImageSelect(file);
    }
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleImageSelect(file);
    }
  };

  // ============================================================
  // IMAGE URL PREVIEW
  // ============================================================

  const handleImageUrlChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      imageUrl: value,
    }));

    // If user starts entering an URL,
    // remove selected local image.
    if (selectedImage) {
      setSelectedImage(null);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview("");
    }

    setError("");
  };

  // ============================================================
  // CLEAR IMAGE
  // ============================================================

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");

    setFormData((previous) => ({
      ...previous,
      imageUrl: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditingId(null);

    setSelectedImage(null);
    setImagePreview("");

    setFormData({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      is_available: true,
    });

    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.name.trim()) {
      setError(
        "Menu item name is required."
      );
      return;
    }

    if (
      !formData.price ||
      Number(formData.price) < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      if (!editingId) {
        data.append(
          "restaurant_id",
          restaurantId
        );
      }

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "is_available",
        formData.is_available
          ? "true"
          : "false"
      );

      // Uploaded image
      if (selectedImage) {
        data.append(
          "image",
          selectedImage
        );
      } else if (
        formData.imageUrl.trim()
      ) {
        // Image URL
        data.append(
          "image_url",
          formData.imageUrl.trim()
        );
      }

      const url = editingId
        ? `${API_URL}/api/menu-items/${editingId}`
        : `${API_URL}/api/menu-items/`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Unable to save menu item."
        );
      }

      if (editingId) {
        setMenuItems((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? result.menu_item
              : item
          )
        );

        setMessage(
          "Menu item updated successfully! ✅"
        );
      } else {
        setMenuItems((previous) => [
          result.menu_item,
          ...previous,
        ]);

        setMessage(
          "Menu item added successfully! 🎉"
        );
      }

      resetForm();
    } catch (err) {
      console.error(
        "Menu save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save menu item."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    setFormData({
      name: item.name || "",
      description:
        item.description || "",
      price: item.price ?? "",
      imageUrl:
        item.image &&
        !item.image.startsWith(
          "/uploads/menu/"
        )
          ? item.image
          : "",
      is_available:
        item.is_available,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (itemId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this menu item?"
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/menu-items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Unable to delete menu item."
        );
      }

      setMenuItems((previous) =>
        previous.filter(
          (item) =>
            item.id !== itemId
        )
      );

      setMessage(
        "Menu item deleted successfully."
      );
    } catch (err) {
      console.error(
        "Menu delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete menu item."
      );
    }
  };

  // ============================================================
  // TOGGLE AVAILABILITY
  // ============================================================

  const handleToggleAvailability = async (
    item
  ) => {
    const token =
      localStorage.getItem("zesthub_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingAvailability(item.id);
      setError("");
      setMessage("");

      const data = new FormData();

      data.append(
        "name",
        item.name || ""
      );

      data.append(
        "description",
        item.description || ""
      );

      data.append(
        "price",
        item.price
      );

      data.append(
        "is_available",
        item.is_available
          ? "false"
          : "true"
      );

      // Preserve existing image URL/path.
      if (item.image) {
        if (
          item.image.startsWith(
            "/uploads/menu/"
          )
        ) {
          // Do not send uploaded file again.
          // Backend preserves existing image.
        } else {
          data.append(
            "image_url",
            item.image
          );
        }
      }

      const response = await fetch(
        `${API_URL}/api/menu-items/${item.id}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Unable to update item availability."
        );
      }

      setMenuItems((previous) =>
        previous.map((menuItem) =>
          menuItem.id === item.id
            ? result.menu_item
            : menuItem
        )
      );

      setMessage(
        result.menu_item.is_available
          ? `${item.name} is now available. ✅`
          : `${item.name} is now unavailable.`
      );
    } catch (err) {
      console.error(
        "Availability update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update item availability."
      );
    } finally {
      setUpdatingAvailability(null);
    }
  };

  // ============================================================
  // IMAGE DISPLAY URL
  // ============================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="manage-menu-page">
        <div className="manage-menu-loading">
          <div className="manage-menu-loading-icon">
            🍽️
          </div>

          <h2>
            Loading Menu...
          </h2>

          <p>
            Getting your restaurant menu ready.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR PAGE
  // ============================================================

  if (error && !restaurant) {
    return (
      <div className="manage-menu-page">
        <div className="manage-menu-error-page">
          <div className="manage-menu-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to Load Menu
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              navigate("/owner")
            }
            className="manage-menu-back-button"
          >
            ← Back to Owner Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-menu-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="manage-menu-header">

        <div>
          <button
            className="manage-menu-back-link"
            onClick={() =>
              navigate("/owner")
            }
          >
            ← Back to Owner Dashboard
          </button>

          <span className="manage-menu-label">
            🍽️ Menu Management
          </span>

          <h1>
            {restaurant?.name}
          </h1>

          <p>
            Add and manage the food items
            available in your restaurant.
          </p>
        </div>

        <button
          className="manage-menu-view-button"
          onClick={() =>
            navigate(
              `/restaurant/${restaurantId}`
            )
          }
        >
          👁️ View Restaurant
        </button>

      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

      {message && (
        <div className="manage-menu-success">
          {message}
        </div>
      )}

      {error && (
        <div className="manage-menu-error">
          {error}
        </div>
      )}

      {/* =====================================================
          FORM
      ====================================================== */}

      <section className="menu-form-section">

        <div className="menu-section-heading">
          <div>
            <span>
              {editingId
                ? "Edit Menu Item"
                : "Add New Item"}
            </span>

            <h2>
              {editingId
                ? "Update Menu Item"
                : "Create Menu Item"}
            </h2>
          </div>
        </div>

        <form
          className="menu-item-form"
          onSubmit={handleSubmit}
        >

          {/* NAME + PRICE */}

          <div className="menu-form-grid">

            <div className="menu-form-group">
              <label htmlFor="menu-name">
                Item Name
              </label>

              <input
                id="menu-name"
                type="text"
                name="name"
                placeholder="Example: Chicken Biryani"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="menu-form-group">
              <label htmlFor="menu-price">
                Price
              </label>

              <input
                id="menu-price"
                type="number"
                name="price"
                placeholder="Example: 180"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="menu-form-group">
            <label htmlFor="menu-description">
              Description
            </label>

            <textarea
              id="menu-description"
              name="description"
              placeholder="Describe the food item..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* =================================================
              IMAGE UPLOAD
          ================================================== */}

          <div className="menu-form-group">

            <label>
              Food Image
            </label>

            <div
              className={`menu-image-dropzone ${
                isDragging
                  ? "dragging"
                  : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileInputChange
                }
                hidden
              />

              {imagePreview ? (

                <div className="menu-image-preview">

                  <img
                    src={imagePreview}
                    alt="Selected food"
                  />

                  <div className="menu-image-preview-text">
                    <strong>
                      Image selected
                    </strong>

                    <span>
                      {selectedImage?.name}
                    </span>
                  </div>

                </div>

              ) : (

                <div className="menu-image-drop-content">

                  <div className="menu-upload-icon">
                    📤
                  </div>

                  <h3>
                    Drag & Drop Image Here
                  </h3>

                  <p>
                    or click to select an image
                  </p>

                  <span>
                    JPG, PNG or WEBP • Maximum 5 MB
                  </span>

                </div>

              )}

            </div>

            {(imagePreview ||
              formData.imageUrl) && (
              <button
                type="button"
                className="menu-remove-image-button"
                onClick={
                  handleRemoveImage
                }
              >
                ✕ Remove Image
              </button>
            )}

          </div>

          {/* =================================================
              IMAGE URL
          ================================================== */}

          <div className="menu-form-group">

            <label htmlFor="menu-image-url">
              Or use an Image URL
            </label>

            <input
              id="menu-image-url"
              type="url"
              name="imageUrl"
              placeholder="https://example.com/food.jpg"
              value={formData.imageUrl}
              onChange={
                handleImageUrlChange
              }
            />

            <small className="menu-image-help">
              You can either upload an image
              above or paste an image URL.
            </small>

          </div>

          {/* =================================================
              IMAGE URL PREVIEW
          ================================================== */}

          {formData.imageUrl.trim() && (
            <div className="menu-url-preview">

              <span>
                Image Preview
              </span>

              <img
                src={formData.imageUrl}
                alt="Food preview"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

            </div>
          )}

          {/* AVAILABILITY */}

          <label className="menu-availability">

            <input
              type="checkbox"
              name="is_available"
              checked={
                formData.is_available
              }
              onChange={handleChange}
            />

            <span>
              Item is currently available
            </span>

          </label>

          {/* FORM ACTIONS */}

          <div className="menu-form-actions">

            <button
              type="submit"
              className="menu-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Menu Item"
                : "Add Menu Item"}
            </button>

            {editingId && (
              <button
                type="button"
                className="menu-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </section>

      {/* =====================================================
          MENU LIST
      ====================================================== */}

      <section className="menu-list-section">

        <div className="menu-section-heading">

          <div>
            <span>
              Restaurant Menu
            </span>

            <h2>
              Menu Items
            </h2>

            <p>
              {menuItems.length} item
              {menuItems.length !== 1
                ? "s"
                : ""}{" "}
              in your menu.
            </p>
          </div>

        </div>

        {menuItems.length === 0 ? (

          <div className="menu-empty-state">

            <div className="menu-empty-icon">
              🍽️
            </div>

            <h3>
              No menu items yet
            </h3>

            <p>
              Add your first food item
              using the form above.
            </p>

          </div>

        ) : (

          <div className="menu-item-grid">

            {menuItems.map((item) => (

              <div
                className="menu-item-card"
                key={item.id}
              >

                {/* FOOD IMAGE */}

                {item.image ? (

                  <div className="menu-card-image">

                    <img
                      src={getImageUrl(
                        item.image
                      )}
                      alt={item.name}
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                ) : (

                  <div className="menu-card-image menu-card-image-placeholder">

                    <span>
                      🍽️
                    </span>

                  </div>

                )}

                {/* CARD HEADER */}

                <div className="menu-item-card-header">

                  <div className="menu-item-icon">
                    🍴
                  </div>

                  <span
                    className={
                      item.is_available
                        ? "menu-status available"
                        : "menu-status unavailable"
                    }
                  >
                    {item.is_available
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>

                {/* CARD CONTENT */}

                <div className="menu-item-content">

                  <h3>
                    {item.name}
                  </h3>

                  <div className="menu-item-price">
                    ₹
                    {Number(
                      item.price
                    ).toFixed(2)}
                  </div>

                  {item.description && (
                    <p>
                      {item.description}
                    </p>
                  )}

                </div>

                {/* ACTIONS */}

                <div className="menu-item-actions">

                  <button
                    className="menu-edit-button"
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className={
                      item.is_available
                        ? "menu-unavailable-button"
                        : "menu-available-button"
                    }
                    onClick={() =>
                      handleToggleAvailability(
                        item
                      )
                    }
                    disabled={
                      updatingAvailability ===
                      item.id
                    }
                  >
                    {updatingAvailability ===
                    item.id
                      ? "Updating..."
                      : item.is_available
                      ? "🔴 Mark Unavailable"
                      : "🟢 Mark Available"}
                  </button>

                  <button
                    className="menu-delete-button"
                    onClick={() =>
                      handleDelete(item.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default ManageMenu;