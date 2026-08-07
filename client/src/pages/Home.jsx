import RestaurantCard from "../components/RestaurantCard/RestaurantCard";

import restaurant1 from "../assets/images/restaurant1.jpg";
import restaurant2 from "../assets/images/restaurant2.jpg";
import restaurant3 from "../assets/images/restaurant3.jpg";


function Home() {

  const restaurants = [
    {
      image: restaurant1,
      name: "Spice Garden",
      rating: "4.5",
      cuisine: "South Indian",
      location: "Trichy",
      price: "₹₹"
    },

    {
      image: restaurant2,
      name: "Burger House",
      rating: "4.3",
      cuisine: "Fast Food",
      location: "Trichy",
      price: "₹"
    },

    {
      image: restaurant3,
      name: "Arabian Nights",
      rating: "4.6",
      cuisine: "Arabian Food",
      location: "Trichy",
      price: "₹₹₹"
    }
  ];


  return (

    <main
      style={{
        minHeight: "100vh",
        background: "#fff8f3",
        padding: "40px"
      }}
    >

      {/* Hero Section */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "60px"
        }}
      >

        <h1
          style={{
            color: "#ff6b35",
            fontSize: "48px"
          }}
        >
          🍽️ ZestHub
        </h1>


        <h2>
          Find Your Perfect Meal
        </h2>


        <p
          style={{
            maxWidth: "600px",
            margin: "20px auto",
            fontSize: "18px"
          }}
        >
          Discover restaurants, browse menus,
          read reviews, and explore amazing
          food around you.
        </p>


        <input
          type="text"
          placeholder="Search restaurants..."
          style={{
            padding: "12px",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />


        <br />
        <br />


        <button
          style={{
            padding: "12px 24px",
            background:"#ff6b35",
            color:"white",
            border:"none",
            borderRadius:"8px",
            cursor:"pointer"
          }}
        >
          Explore Restaurants
        </button>

      </div>



      {/* Restaurant Section */}


      <section>

        <h2
          style={{
            textAlign:"center",
            marginBottom:"30px"
          }}
        >
          Popular Restaurants 🍴
        </h2>



        <div
          style={{
            display:"flex",
            justifyContent:"center",
            gap:"30px",
            flexWrap:"wrap"
          }}
        >

          {
            restaurants.map((restaurant,index)=>(

              <RestaurantCard
                key={index}
                {...restaurant}
              />

            ))
          }


        </div>


      </section>


    </main>

  );
}


export default Home;