import "./Newsletter.css";


function Newsletter(){

    return(

        <section className="newsletter">


            <div className="newsletter-content">


                <h2>
                    Stay Updated with ZestHub
                </h2>


                <p>
                    Get updates about new restaurants,
                    community reviews, and exciting features.
                </p>


                <div className="subscribe-box">


                    <input
                        type="email"
                        placeholder="Enter your email"
                    />


                    <button>
                        Subscribe
                    </button>


                </div>


            </div>


        </section>

    );

}


export default Newsletter;