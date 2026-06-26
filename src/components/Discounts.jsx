import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "UP TO 50% OFF",
    subtitle: "Classic Solitaire Diamond Rings",
    desc: "Exquisite conflict-free diamond engagement bands set in 18k white gold.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
    category: "rings",
    tag: "FESTIVE SALE"
  },
  {
    id: 2,
    title: "20% OFF GOLD NECKLACES",
    subtitle: "Timeless Handcrafted Pendants",
    desc: "Fluid infinity loops and matching gold box chains crafted in solid gold.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
    category: "necklaces",
    tag: "GOLDEN HOUR"
  },
  {
    id: 3,
    title: "BUY 1 GET 1 30% OFF",
    subtitle: "Royal Sapphire Tennis Bracelets",
    desc: "Dazzling deep-blue sapphires paired with pavé-set platinum bangles.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
    category: "bracelets",
    tag: "EXCLUSIVE WRISTWEAR"
  }
];

const collectionsList = [
  { name: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200", value: "rings" },
  { name: "Necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200", value: "necklaces" },
  { name: "Bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200", value: "bracelets" },
  { name: "Earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200", value: "earrings" }
];

function Discounts() {
  const [current, setCurrent] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // Autoplay slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const handleSelectOffer = (categoryValue) => {
    // Update category query search param
    setSearchParams({ category: categoryValue });
    // Scroll smoothly to catalog
    const catalogElement = document.getElementById('featured-products');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="offers-collections-section">
      {/* 1. Category Collection Types list */}
      <div className="collection-types-container">
        <div className="section-title-wrapper">
          <Sparkles className="gold-sparkle" size={20} />
          <h2>Shop by Collection Type</h2>
          <div className="gold-bar"></div>
        </div>
        
        <div className="collection-types-grid">
          {collectionsList.map((col, idx) => (
            <div 
              key={idx} 
              className="collection-type-card"
              onClick={() => handleSelectOffer(col.value)}
            >
              <div className="col-img-wrapper">
                <img src={col.image} alt={col.name} />
              </div>
              <h4>{col.name}</h4>
              <span>View Collections</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Offers Carousel Slider */}
      <div className="offers-carousel-wrapper">
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div 
              className={`carousel-slide ${index === current ? 'active' : ''}`}
              key={slide.id}
              style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${slide.image})` }}
            >
              {index === current && (
                <div className="slide-content">
                  <span className="slide-tag">{slide.tag}</span>
                  <h2>{slide.title}</h2>
                  <h3>{slide.subtitle}</h3>
                  <p>{slide.desc}</p>
                  <button 
                    onClick={() => handleSelectOffer(slide.category)} 
                    className="slide-cta-btn"
                  >
                    Claim Offer & Shop
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        <button onClick={prevSlide} className="carousel-nav-btn prev" aria-label="Previous Offer">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="carousel-nav-btn next" aria-label="Next Offer">
          <ChevronRight size={24} />
        </button>

        {/* Dot Indicators */}
        <div className="carousel-dots">
          {slides.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrent(idx)}
              className={`carousel-dot-btn ${idx === current ? 'active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Discounts;