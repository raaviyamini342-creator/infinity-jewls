import React, { useEffect, useState, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, User, Mail } from 'lucide-react';

function Profile() {
  const { user, token, loading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, send to login
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to load orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Could not fetch order history.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading || !user) {
    return (
      <div className="profile-loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-grid-wrapper">
        
        {/* User Card */}
        <div className="profile-user-card">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2>{user.name}</h2>
          
          <div className="user-details-list">
            <div className="detail-item">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              <span>Member since: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <User size={16} />
              <span>Role: <strong style={{ color: '#d4af37' }}>{user.role}</strong></span>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="profile-orders-column">
          <h2>Order History</h2>
          
          {ordersLoading ? (
            <div className="orders-loading-small">
              <div className="spinner-small"></div>
              <span>Fetching order history...</span>
            </div>
          ) : error ? (
            <p className="order-error-message">{error}</p>
          ) : orders.length === 0 ? (
            <div className="no-orders-box">
              <Package size={48} />
              <p>You haven't placed any bookings yet.</p>
              <Link to="/" className="start-shopping-profile-btn">Discover Collection</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div className="order-history-card" key={order.id}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">Order ID: #{order.id}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`status-pill ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-list-summary">
                      {order.items.map((item, idx) => (
                        <div className="order-item-history-row" key={idx}>
                          <span>{item.name} <strong>x{item.quantity}</strong></span>
                          <span>${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-shipping-summary">
                      <p><strong>Shipping to:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <span>Grand Total:</span>
                    <span className="order-total-price">${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
