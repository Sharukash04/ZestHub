import API_URL from "../config";

import restaurant1 from "../assets/images/restaurant1.jpg";
import restaurant2 from "../assets/images/restaurant2.jpg";
import restaurant3 from "../assets/images/restaurant3.jpg";

/*
|--------------------------------------------------------------------------
| Local restaurant images
|--------------------------------------------------------------------------
| These are the old/static restaurant images stored inside React.
|
| Backend may return names such as:
|   chinese-wok.jpg
|   gorets-cafe.jpg
|   cascade-cafe.jpg
|   grill-chicken.jpg
|
| We map those names to the correct React assets here.
|--------------------------------------------------------------------------
*/

const LOCAL_IMAGES = {
  "chinese-wok.jpg": restaurant2,
  "gorets-cafe.jpg": restaurant1,
  "cascade-cafe.jpg": restaurant1,
  "grill-chicken.jpg": restaurant1,
};

/*
|--------------------------------------------------------------------------
| Fallback image
|--------------------------------------------------------------------------
*/

export const FALLBACK_RESTAURANT_IMAGE = restaurant1;

/*
|--------------------------------------------------------------------------
| Get restaurant image
|--------------------------------------------------------------------------
|
| Supported image formats:
|
| 1. Full URL
|    https://example.com/image.jpg
|
| 2. Backend upload
|    /uploads/restaurants/image.jpg
|
| 3. Backend upload without leading slash
|    uploads/restaurants/image.jpg
|
| 4. Local React image name
|    chinese-wok.jpg
|
| 5. Empty/unknown image
|    → fallback image
|--------------------------------------------------------------------------
*/

export function getRestaurantImage(image) {
  // No image
  if (!image) {
    return FALLBACK_RESTAURANT_IMAGE;
  }

  // Make sure the value is a string
  if (typeof image !== "string") {
    return FALLBACK_RESTAURANT_IMAGE;
  }

  // Remove accidental spaces
  const cleanImage = image.trim();

  if (!cleanImage) {
    return FALLBACK_RESTAURANT_IMAGE;
  }

  /*
  |--------------------------------------------------------------------------
  | Full external URL
  |--------------------------------------------------------------------------
  */

  if (/^https?:\/\//i.test(cleanImage)) {
    return cleanImage;
  }

  /*
  |--------------------------------------------------------------------------
  | Local React image
  |--------------------------------------------------------------------------
  */

  if (LOCAL_IMAGES[cleanImage]) {
    return LOCAL_IMAGES[cleanImage];
  }

  /*
  |--------------------------------------------------------------------------
  | FastAPI uploaded image
  |--------------------------------------------------------------------------
  */

  if (cleanImage.startsWith("/uploads/")) {
    return `${API_URL}${cleanImage}`;
  }

  if (cleanImage.startsWith("uploads/")) {
    return `${API_URL}/${cleanImage}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Handle backend paths beginning with "/"
  |--------------------------------------------------------------------------
  */

  if (cleanImage.startsWith("/")) {
    return `${API_URL}${cleanImage}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Unknown image
  |--------------------------------------------------------------------------
  */

  return FALLBACK_RESTAURANT_IMAGE;
}