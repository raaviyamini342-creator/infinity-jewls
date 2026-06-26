import React, { useEffect, useState, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Package, ShoppingBag, Mail, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';

function AdminDashboard() {
  const { user, token, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active view tab
  const [activeTab, setActiveTab] = useState('orders');

  // Backend States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Add Product Form fields
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('rings');
  const [prodStock, setProdStock] = useState('10');
  const [prodImage, setProdImage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch admin databases
  const fetchAdminData = async () => {
    if (!token) return;
    setDbLoading(true);
    try {
      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // Fetch products
      const productsRes = await fetch(`${API_URL}/products`);
      const productsData = await productsRes.json();
      setProducts(productsData);

      // Fetch messages
      const messagesRes = await fetch(`${API_URL}/contact/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const messagesData = await messagesRes.json();
      setMessages(messagesData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showAlert('Could not load administrative databases.', 'error');
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user, token]);

  const showAlert = (text, type = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => {
      setAlertMsg({ text: '', type: '' });
    }, 4000);
  };

  // 1. Order Status Updates
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showAlert(`Order #${orderId} marked as ${newStatus}`);
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // 2. Product Add Submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) {
      showAlert('Please enter Name, Price and Stock.', 'error');
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: prodName,
          description: prodDesc,
          price: parseFloat(prodPrice),
          category: prodCategory,
          stock: parseInt(prodStock),
          image: prodImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Product creation failed');
      }

      setProducts(prev => [data, ...prev]);
      showAlert(`Product "${prodName}" added successfully.`);
      
      // Clear fields
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdCategory('rings');
      setProdStock('10');
      setProdImage('');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // 3. Product Delete
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this jewelry item?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
      showAlert('Product deleted successfully');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // 4. Mark Contact Message as Read
  const handleMarkMessageRead = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/contact/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
      showAlert('Message marked as read.');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Verifying administrative clearance...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Alert Banner */}
      {alertMsg.text && (
        <div className={`admin-alert-banner ${alertMsg.type}`}>
          <AlertCircle size={20} />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="admin-header-dashboard">
        <div className="admin-title-row">
          <Shield size={32} />
          <h1>Administrative Center</h1>
        </div>
        <p>Manage jewelry products catalog, check order bookings, and view client inquiry submissions.</p>
      </div>

      {/* Tabs Menu */}
      <div className="admin-tabs-nav">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <ShoppingBag size={18} />
          Orders Booked ({orders.length})
        </button>

        <button 
          onClick={() => setActiveTab('products')}
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          <Package size={18} />
          Jewelry Catalog ({products.length})
        </button>

        <button 
          onClick={() => setActiveTab('messages')}
          className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
        >
          <Mail size={18} />
          Client Messages ({messages.length})
        </button>
      </div>

      {dbLoading ? (
        <div className="admin-loading-data">
          <div className="spinner"></div>
          <p>Connecting to database services...</p>
        </div>
      ) : (
        <div className="admin-dashboard-content">
          
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="admin-orders-tab-view">
              <h2>Orders Booked</h2>
              {orders.length === 0 ? (
                <p className="no-admin-data-alert">No bookings placed in the system yet.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Client</th>
                        <th>Booked Date</th>
                        <th>Items Ordered</th>
                        <th>Total</th>
                        <th>Ship Details</th>
                        <th>Status / Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td><strong>#{order.id}</strong></td>
                          <td>
                            <div>{order.userName}</div>
                            <span style={{ fontSize: '12px', color: '#888' }}>{order.userEmail}</span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-items-td-list">
                              {order.items.map((item, idx) => (
                                <div key={idx}>{item.name} x{item.quantity}</div>
                              ))}
                            </div>
                          </td>
                          <td><strong>${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                          <td>
                            <div className="admin-address-tooltip" title={order.shippingAddress.phone}>
                              {order.shippingAddress.address}, {order.shippingAddress.city}
                            </div>
                          </td>
                          <td>
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className={`status-selector ${order.status.toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="admin-products-tab-view">
              
              {/* Product catalog form & table grid */}
              <div className="admin-products-layout">
                {/* Form to add products */}
                <div className="admin-add-product-card">
                  <h3>Add New Catalog Item</h3>
                  <form onSubmit={handleAddProduct} className="admin-product-form">
                    <div className="form-group">
                      <label>Jewelry Name</label>
                      <input 
                        type="text" 
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="e.g. Royal Sapphire Studs"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        rows="3" 
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Specify details, materials and cut..."
                      ></textarea>
                    </div>

                    <div className="form-row-two">
                      <div className="form-group">
                        <label>Price ($)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="999.00"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Stock Count</label>
                        <input 
                          type="number" 
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          placeholder="10"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-two">
                      <div className="form-group">
                        <label>Category</label>
                        <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                          <option value="rings">Rings</option>
                          <option value="necklaces">Necklaces</option>
                          <option value="bracelets">Bracelets</option>
                          <option value="earrings">Earrings</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Image URL</label>
                        <input 
                          type="text" 
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="admin-product-submit-btn"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <span className="spinner-small"></span>
                      ) : (
                        <>
                          <Plus size={16} />
                          Add to Catalog
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* List of current products */}
                <div className="admin-products-list-column">
                  <h3>Current Inventory</h3>
                  <div className="admin-products-table-wrapper">
                    <table className="admin-data-table select-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(prod => (
                          <tr key={prod.id}>
                            <td>
                              <img src={prod.image} alt={prod.name} className="admin-prod-thumb" />
                            </td>
                            <td>
                              <strong>{prod.name}</strong>
                            </td>
                            <td><span className="admin-cat-tag">{prod.category}</span></td>
                            <td>${prod.price.toFixed(2)}</td>
                            <td>
                              {prod.stock === 0 ? (
                                <span style={{ color: '#d9534f', fontWeight: 'bold' }}>Sold Out</span>
                              ) : (
                                prod.stock
                              )}
                            </td>
                            <td>
                              <button 
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="admin-delete-row-btn"
                                title="Delete Catalog Item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="admin-messages-tab-view">
              <h2>Client Inquiry Submissions</h2>
              {messages.length === 0 ? (
                <p className="no-admin-data-alert">No inquiry submissions found.</p>
              ) : (
                <div className="admin-messages-feed">
                  {messages.map(msg => (
                    <div className={`admin-msg-card ${msg.read ? 'read' : 'unread'}`} key={msg.id}>
                      <div className="admin-msg-header">
                        <div>
                          <h4>{msg.subject}</h4>
                          <span className="admin-msg-sender">From: <strong>{msg.name}</strong> ({msg.email})</span>
                        </div>
                        <div className="admin-msg-meta">
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                          {!msg.read && (
                            <button 
                              onClick={() => handleMarkMessageRead(msg.id)}
                              className="mark-read-btn"
                              title="Mark as Read"
                            >
                              <Check size={16} />
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="admin-msg-body">
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
