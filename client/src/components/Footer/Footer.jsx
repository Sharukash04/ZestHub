import "./Footer.css";

import {
    FaInstagram,
    FaFacebook,
    FaTwitter
} from "react-icons/fa";


function Footer(){

    return(

        <footer className="footer">


            <div className="footer-container">


                <div className="footer-brand">

                    <h2>
                        🍽 ZestHub
                    </h2>

                    <p>
                        Discover restaurants, explore cuisines,
                        and share your dining experiences.
                    </p>

                </div>



                <div className="footer-links">

                    <h3>
                        Explore
                    </h3>

                    <p>Restaurants</p>
                    <p>Categories</p>
                    <p>Reviews</p>
                    <p>Community</p>

                </div>



                <div className="footer-links">

                    <h3>
                        Company
                    </h3>

                    <p>About Us</p>
                    <p>Contact</p>
                    <p>Privacy Policy</p>
                    <p>Terms</p>

                </div>



                <div className="footer-social">

                    <h3>
                        Follow Us
                    </h3>


                    <div className="social-icons">

                        <FaInstagram />
                        <FaFacebook />
                        <FaTwitter />

                    </div>


                </div>


            </div>



            <div className="footer-bottom">

                © 2026 ZestHub. All Rights Reserved.

            </div>


        </footer>

    );

}


export default Footer;