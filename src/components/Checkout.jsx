import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { API_URL } from '../config';
import { CreditCard, CheckCircle, AlertCircle, MapPin, Phone, User, MessageSquare } from 'lucide-react';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationVal, setLocationVal] = useState('');

  // Checkout states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // If cart is empty and not ordered successfully yet, block page
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-blocked-container">
        <h2>Empty Cart</h2>
        <p>You cannot check out with an empty cart.</p>
        <Link to="/" className="continue-shopping-btn">Go to Shop</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !locationVal) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customerName: name,
        customerPhone: phone,
        shippingLocation: locationVal,
        totalPrice: cartTotal
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Order success!
      setOrderSuccess(data);
      clearCart(); // Clear cart state

      // Open WhatsApp pre-filled receipt
      const orderItemsText = data.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n');
      const whatsappText = `✨ *INFINITY JEWLS - ORDER RECEIPT* ✨\n\n` +
        `*Order ID:* #${data.id}\n` +
        `*Customer Name:* ${data.userName}\n` +
        `*Mobile Number:* ${data.userPhone}\n` +
        `*Location/Address:* ${data.shippingAddress.address}\n\n` +
        `*Items Ordered:*\n${orderItemsText}\n\n` +
        `*Total Price:* $${data.totalPrice.toFixed(2)}\n\n` +
        `Please confirm my booking!`;

      const whatsappLink = `https://api.whatsapp.com/send?phone=${data.adminWhatsApp}&text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappLink, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (orderSuccess) {
    const orderItemsText = orderSuccess.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n');
    const whatsappText = `✨ *INFINITY JEWLS - ORDER RECEIPT* ✨\n\n` +
      `*Order ID:* #${orderSuccess.id}\n` +
      `*Customer Name:* ${orderSuccess.userName}\n` +
      `*Mobile Number:* ${orderSuccess.userPhone}\n` +
      `*Location/Address:* ${orderSuccess.shippingAddress.address}\n\n` +
      `*Items Ordered:*\n${orderItemsText}\n\n` +
      `*Total Price:* $${orderSuccess.totalPrice.toFixed(2)}\n\n` +
      `Please confirm my booking!`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=${orderSuccess.adminWhatsApp}&text=${encodeURIComponent(whatsappText)}`;

    return (
      <div className="checkout-success-page">
        <div className="success-card">
          <CheckCircle size={72} className="success-icon" />
          <h2>Order Booked!</h2>
          <p className="order-id-label">Order ID: <strong>#{orderSuccess.id}</strong></p>
          
          <div className="success-details-box">
            <p>Thank you for booking with Infinity Jewls, <strong>{orderSuccess.userName}</strong>!</p>
            <p>We are opening WhatsApp to send your order confirmation details directly to us. If it didn't open automatically, please click the button below.</p>
          </div>

          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="whatsapp-send-receipt-btn"
          >
            <MessageSquare size={18} />
            Send Order Details to WhatsApp
          </a>

          <div className="success-actions" style={{ marginTop: '20px' }}>
            <Link to="/" className="continue-shopping-secondary-btn" style={{ width: '100%' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Complete your contact and delivery information to confirm the order</p>
      </div>

      <div className="checkout-grid">
        {/* Shipping Form */}
        <div className="checkout-form-column">
          <h2>Order Information</h2>
          {error && (
            <div className="checkout-error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label>Your Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>WhatsApp / Mobile Number</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input 
                  type="tel" 
                  placeholder="e.g. +91 93920 73910" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Location / Address</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input 
                  type="text" 
                  placeholder="Street name, City, State, Landmark" 
                  value={locationVal}
                  onChange={(e) => setLocationVal(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="payment-simulation-alert">
              <CreditCard size={18} />
              <div>
                <strong>WhatsApp Order Booking</strong>
                <p>No credit card details needed! Confirming your booking will instantly open WhatsApp to message order details to our store executive.</p>
              </div>
            </div>

            <button 
              type="submit" 
              className="confirm-order-submit-btn" 
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-small"></span>
              ) : (
                `Confirm & Send Order via WhatsApp - $${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="checkout-summary-column">
          <h2>Order Summary</h2>
          <div className="checkout-summary-box">
            <div className="checkout-items-preview">
              {cartItems.map(item => (
                <div className="checkout-preview-row" key={item.productId}>
                  <div className="preview-img-title">
                    <div className="preview-qty-badge">{item.quantity}</div>
                    <img src={item.image} alt={item.name} />
                    <span>{item.name}</span>
                  </div>
                  <span className="preview-subtotal">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="summary-row divider"></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping-text">FREE</span>
            </div>
            <div className="summary-row divider"></div>
            <div className="summary-row checkout-total">
              <span>Total Price</span>
              <span>${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
