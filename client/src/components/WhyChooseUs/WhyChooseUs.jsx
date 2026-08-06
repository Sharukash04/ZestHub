import "./WhyChooseUs.css";

import {
    FaCheckCircle,
    FaStar,
    FaSearchLocation,
    FaHeart
} from "react-icons/fa";


function WhyChooseUs(){

    const features = [

        {
            icon:<FaCheckCircle />,
            title:"Verified Restaurants",
            description:
            "Discover restaurants with accurate information and trusted listings."
        },

        {
            icon:<FaStar />,
            title:"Honest Reviews",
            description:
            "Read genuine ratings and experiences shared by food lovers."
        },

        {
            icon:<FaSearchLocation />,
            title:"Smart Discovery",
            description:
            "Find restaurants based on location, cuisine and preferences."
        },

        {
            icon:<FaHeart />,
            title:"Save Favorites",
            description:
            "Create your personal collection of favorite dining places."
        }

    ];


    return(

        <section className="why-section">


            <div className="why-header">

                <h2>
                    Why Choose ZestHub?
                </h2>

                <p>
                    Making restaurant discovery simple, reliable and enjoyable.
                </p>

            </div>



            <div className="feature-container">


                {
                    features.map((feature,index)=>(

                        <div 
                        className="feature-card"
                        key={index}
                        >


                            <div className="feature-icon">

                                {feature.icon}

                            </div>


                            <h3>
                                {feature.title}
                            </h3>


                            <p>
                                {feature.description}
                            </p>


                        </div>

                    ))
                }


            </div>


        </section>

    );

}


export default WhyChooseUs;