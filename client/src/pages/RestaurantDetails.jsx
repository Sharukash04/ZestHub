import "./RestaurantDetails.css";

import { useParams } from "react-router-dom";


function RestaurantDetails(){

    const { id } = useParams();


    return (

        <div className="details-page">

            <h1>
                Restaurant Details
            </h1>


            <h2>
                Restaurant ID : {id}
            </h2>


        </div>

    );

}


export default RestaurantDetails;