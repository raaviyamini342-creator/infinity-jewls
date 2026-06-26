import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { API_URL } from '../config';
import { Search, Filter, ArrowUpDown, ShoppingBag } from 'lucide-react';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const [sortBy, setSortBy] = useState('default');
  
  // Cart notifications
  const [addedProductId, setAddedProductId] = useState(null);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load jewelry catalog. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort products
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [category, search, sortBy, products]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  if (loading) {
    return (
      <section className="products-loading">
        <div className="spinner"></div>
        <p>Loading our exclusive jewelry collections...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="products-error">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="products-catalog-section" id="featured-products">
      <div className="section-header">
        <h2>Featured Collections</h2>
        <div className="luxury-divider"></div>
        <p>Exquisite craftsmanship in every design, curated for your timeless moments.</p>
      </div>

      {/* Catalog Filters Bar */}
      <div className="catalog-filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search jewelry..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-select-wrapper">
            <Filter size={16} />
            <select value={category} onChange={(e) => setSearchParams({ category: e.target.value })}>
              <option value="all">All Categories</option>
              <option value="rings">Rings</option>
              <option value="necklaces">Necklaces</option>
              <option value="bracelets">Bracelets</option>
              <option value="earrings">Earrings</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <ArrowUpDown size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Default Sorting</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products-found">
          <p>No products match your criteria. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map(product => (
            <div className="luxury-product-card" key={product.id}>
              <div className="card-image-container">
                <img src={product.image} alt={product.name} />
                {product.stock === 0 && <span className="sold-out-badge">Sold Out</span>}
                {product.stock > 0 && product.stock <= 3 && (
                  <span className="low-stock-badge">Only {product.stock} left</span>
                )}
              </div>
              <div className="card-info">
                <span className="product-category-tag">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="product-card-desc">{product.description}</p>
                <div className="card-footer">
                  <span className="product-card-price">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`add-to-cart-btn ${addedProductId === product.id ? 'success' : ''}`}
                  >
                    {addedProductId === product.id ? (
                      'Added!'
                    ) : product.stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;