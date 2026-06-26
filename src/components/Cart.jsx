import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <ShoppingBag size={64} className="empty-cart-icon" />
          <h2>Your Shopping Cart is Empty</h2>
          <p>Explore our exclusive collection and add products to start shopping.</p>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <p>You have {cartCount} item(s) in your cart</p>
      </div>

      <div className="cart-content-wrapper">
        {/* Cart items list */}
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div className="cart-item-row" key={item.productId}>
              <div className="cart-item-img">
                <img src={item.image} alt={item.name} />
              </div>

              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <span className="cart-item-price-unit">${item.price.toLocaleString()} each</span>
              </div>

              <div className="cart-item-quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="qty-adjust-btn"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-number-display">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="qty-adjust-btn"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="cart-item-subtotal">
                <span>${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <button 
                onClick={() => removeFromCart(item.productId)}
                className="cart-item-delete-btn"
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary box */}
        <div className="cart-summary-box">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items Count</span>
            <span>{cartCount}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="free-shipping-text">FREE</span>
          </div>
          <div className="summary-row divider"></div>
          <div className="summary-row total">
            <span>Estimated Total</span>
            <span className="total-amount">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <button 
            onClick={handleCheckoutClick} 
            className="checkout-proceed-btn"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>


        </div>
      </div>
    </div>
  );
}

export default Cart;
