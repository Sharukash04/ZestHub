import "./CommunityPreview.css";

import {
    FaUsers,
    FaComments,
    FaCamera
} from "react-icons/fa";


function CommunityPreview(){

    const communityFeatures = [

        {
            icon:<FaUsers />,
            title:"Food Lovers Community",
            text:"Connect with people who love exploring new restaurants."
        },

        {
            icon:<FaComments />,
            title:"Share Experiences",
            text:"Post your restaurant experiences and opinions."
        },

        {
            icon:<FaCamera />,
            title:"Food Stories",
            text:"Share photos and discover amazing food places."
        }

    ];


    return(

        <section className="community">


            <div className="community-header">

                <h2>
                    Join the ZestHub Community
                </h2>

                <p>
                    Discover restaurants, share experiences,
                    and connect with food lovers.
                </p>

            </div>


            <div className="community-container">


                {
                    communityFeatures.map((item,index)=>(

                        <div 
                        className="community-card"
                        key={index}
                        >

                            <div className="community-icon">
                                {item.icon}
                            </div>


                            <h3>
                                {item.title}
                            </h3>


                            <p>
                                {item.text}
                            </p>


                        </div>

                    ))
                }


            </div>


            <div className="coming-box">

                🚀 Community Features Coming Soon

            </div>


        </section>

    );

}


export default CommunityPreview;