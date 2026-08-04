import Navbar from "./components/Navbar";
import Hero from "./components/Hero/Hero";
import CategoryCard from "./components/CategoryCard";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <CategoryCard />
      </main>
    </>
  );
}

export default App;