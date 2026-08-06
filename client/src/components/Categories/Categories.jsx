import "./Categories.css";

import pizza from "../../assets/images/pizza.jpg";
import burger from "../../assets/images/burger.jpg";
import biryani from "../../assets/images/biryani.jpg";
import cafe from "../../assets/images/cafe.jpg";
import desserts from "../../assets/images/desserts.jpg";


function Categories(){

    const categories = [
        {
            name:"Pizza",
            image:pizza
        },
        {
            name:"Burger",
            image:burger
        },
        {
            name:"Biryani",
            image:biryani
        },
        {
            name:"Cafe",
            image:cafe
        },
        {
            name:"Desserts",
            image:desserts
        }
    ];


    return(

        <section className="categories">

            <h2>
                Explore Food Categories
            </h2>

            <p>
                Discover restaurants based on your favorite cuisines
            </p>


            <div className="category-container">

                {
                    categories.map((category,index)=>(

                        <div 
                        className="category-card"
                        key={index}
                        >

                            <img 
                            src={category.image}
                            alt={category.name}
                            />

                            <h3>
                                {category.name}
                            </h3>

                        </div>

                    ))
                }


            </div>


        </section>

    );

}


export default Categories;