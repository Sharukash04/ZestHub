import "./RestaurantCard.css";

import {
  FaStar,
  FaMapMarkerAlt,
  FaUtensils,
} from "react-icons/fa";

import {
  getRestaurantImage,
  FALLBACK_RESTAURANT_IMAGE,
} from "../../utils/restaurantImage";

function RestaurantCard({
  image,
  name,
  rating,
  cuisine,
  location,
  price,
  onClick,
}) {
  const imageUrl = getRestaurantImage(image);

  const numericRating = Number(rating || 0);

  return (
    <div
      className="restaurant-card"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >

      <div className="restaurant-card-image">

        <img
          src={imageUrl}
          alt={name || "Restaurant"}
          onError={(event) => {
            event.currentTarget.onerror = null;

            event.currentTarget.src =
              FALLBACK_RESTAURANT_IMAGE;
          }}
        />

        {numericRating > 0 && (
          <div className="restaurant-card-rating">
            <FaStar />
            {numericRating.toFixed(1)}
          </div>
        )}

      </div>

      <div className="restaurant-info">

        <h3>
          {name || "Restaurant"}
        </h3>

        <div className="restaurant-card-detail">

          <FaUtensils />

          <span>
            {cuisine || "Restaurant"}
          </span>

        </div>

        <div className="restaurant-card-detail">

          <FaMapMarkerAlt />

          <span>
            {location || "Location unavailable"}
          </span>

        </div>

        {price && (
          <p className="price">
            {price}
          </p>
        )}

      </div>

    </div>
  );
}

export default RestaurantCard;