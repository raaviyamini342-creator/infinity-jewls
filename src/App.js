import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Discounts from "./components/Discounts";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Products />
      <Discounts />
      <Testimonials />
      <Footer />
    </>
  );
}

export default App;