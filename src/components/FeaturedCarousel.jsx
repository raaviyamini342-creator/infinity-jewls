import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { API_URL } from '../config';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

function FeaturedCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [addedProductId, setAddedProductId] = useState(null);
  const [visibleItems, setVisibleItems] = useState(3);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Display all products in this scrollable best seller section
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const nextCard = () => {
    if (products.length <= visibleItems) return;
    setCurrent(prev => (prev >= products.length - visibleItems ? 0 : prev + 1));
  };

  const prevCard = () => {
    if (products.length <= visibleItems) return;
    setCurrent(prev => (prev === 0 ? products.length - visibleItems : prev - 1));
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  if (loading || products.length === 0) {
    return null; // Silent load
  }

  return (
    <section className="featured-products-slider-section">
      <div className="section-header">
        <span className="subtitle-decor">EXQUISITE MASTERPIECES</span>
        <h2>Best Sellers</h2>
        <div className="luxury-divider"></div>
        <p>A closer look at our most coveted, hand-selected luxury pieces.</p>
      </div>

      <div className="featured-cards-carousel-wrapper">
        <div className="cards-slider-container">
          <button 
            onClick={prevCard} 
            className="slider-nav-btn prev" 
            aria-label="Previous Item"
            style={{ display: products.length <= visibleItems ? 'none' : 'flex' }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="carousel-container">
            <div 
              className="carousel-track" 
              style={{ transform: `translateX(-${current * (100 / visibleItems)}%)` }}
            >
              {products.map((prod) => (
                <div 
                  key={prod.id} 
                  className="carousel-slide-wrapper" 
                  style={{ flex: `0 0 ${100 / visibleItems}%` }}
                >
                  <div className="luxury-product-card carousel-card">
                    <div className="card-image-container">
                      <img src={prod.image} alt={prod.name} />
                      {prod.stock === 0 && <span className="sold-out-badge">Sold Out</span>}
                      {prod.stock > 0 && prod.stock <= 3 && (
                        <span className="low-stock-badge">Only {prod.stock} left</span>
                      )}
                    </div>
                    
                    <div className="card-info">
                      <span className="product-category-tag">{prod.category}</span>
                      <h3>{prod.name}</h3>
                      <p className="product-card-desc">{prod.description}</p>
                      
                      <div className="card-footer">
                        <span className="product-card-price">${prod.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        
                        <div className="carousel-card-actions">
                          <button 
                            onClick={() => handleAddToCart(prod)}
                            disabled={prod.stock === 0}
                            className={`add-to-cart-btn ${addedProductId === prod.id ? 'success' : ''}`}
                            style={{ padding: '8px 12px', fontSize: '12px' }}
                          >
                            {addedProductId === prod.id ? (
                              'Added!'
                            ) : prod.stock === 0 ? (
                              'Sold Out'
                            ) : (
                              <>
                                <ShoppingBag size={14} style={{ marginRight: '4px' }} />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={nextCard} 
            className="slider-nav-btn next" 
            aria-label="Next Item"
            style={{ display: products.length <= visibleItems ? 'none' : 'flex' }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Indicators */}
        {products.length > visibleItems && (
          <div className="slider-dots">
            {Array.from({ length: products.length - visibleItems + 1 }).map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrent(idx)}
                className={`slider-dot ${idx === current ? 'active' : ''}`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCarousel;
