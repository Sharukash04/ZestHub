import "./TrendingRestaurants.css";

import cafe from "../../assets/images/cafe.jpg";
import biryani from "../../assets/images/biryani.jpg";
import burger from "../../assets/images/burger.jpg";


function TrendingRestaurants(){

    const restaurants = [

        {
            name:"Cafe Aroma",
            image:cafe,
            rating:"4.7",
            reviews:"2.1K",
            location:"Trichy",
            cuisine:"Cafe & Snacks"
        },

        {
            name:"Royal Biryani",
            image:biryani,
            rating:"4.8",
            reviews:"3.5K",
            location:"Chennai",
            cuisine:"Biryani"
        },

        {
            name:"Burger Point",
            image:burger,
            rating:"4.6",
            reviews:"1.8K",
            location:"Madurai",
            cuisine:"Fast Food"
        }

    ];


    return(

        <section className="trending">


            <div className="trending-header">

                <h2>
                    🔥 Trending Restaurants
                </h2>

                <p>
                    Discover places loved by the ZestHub community
                </p>

            </div>



            <div className="trending-container">


            {
                restaurants.map((restaurant,index)=>(

                    <div 
                    className="trend-card"
                    key={index}
                    >

                        <img 
                        src={restaurant.image}
                        alt={restaurant.name}
                        />


                        <div className="trend-info">


                            <h3>
                                {restaurant.name}
                            </h3>


                            <span className="rating">
                                ⭐ {restaurant.rating}
                            </span>


                            <p>
                                💬 {restaurant.reviews} Reviews
                            </p>


                            <p>
                                📍 {restaurant.location}
                            </p>


                            <p>
                                🍽️ {restaurant.cuisine}
                            </p>


                        </div>


                    </div>

                ))
            }


            </div>


        </section>

    );

}


export default TrendingRestaurants;