import "./RestaurantCard.css";

function RestaurantCard({ image, name, rating, cuisine, location, price }) {
  return (
    <div className="restaurant-card">

      <img src={image} alt={name} />

      <div className="restaurant-info">
        <h3>{name}</h3>

        <div className="rating">
          ⭐ {rating}
        </div>

        <p>🍴 {cuisine}</p>

        <p>📍 {location}</p>

        <p className="price">{price}</p>
      </div>

    </div>
  );
}

export default RestaurantCard; 