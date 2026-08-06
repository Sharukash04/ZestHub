import Navbar from "./components/Navbar";
import Hero from "./components/Hero/Hero";
import Categories from "./components/Categories";
import FeaturedRestaurants from "./components/FeaturedRestaurants";
import TrendingRestaurants from "./components/TrendingRestaurants";
import WhyChooseUs from "./components/WhyChooseUs";
import CommunityPreview from "./components/CommunityPreview";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Categories />
        <FeaturedRestaurants />
        <TrendingRestaurants />
        <WhyChooseUs />
        <CommunityPreview />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

export default App;  