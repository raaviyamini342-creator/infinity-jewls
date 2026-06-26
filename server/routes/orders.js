const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, admin } = require('../middleware/auth');
const { sendMail } = require('../mailer');

// Place Order (Guest Checkout)
router.post('/', async (req, res) => {
  try {
    const { items, customerName, customerPhone, shippingLocation, totalPrice } = req.body;

    if (!items || items.length === 0 || !customerName || !customerPhone || !shippingLocation) {
      return res.status(400).json({ message: 'Missing order details.' });
    }

    // Verify stock and fetch items
    const orderedItems = [];
    for (const item of items) {
      const dbProduct = db.products.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name} not found.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock}` });
      }

      // Deduct stock
      db.products.updateById(item.productId, {
        stock: dbProduct.stock - item.quantity
      });

      orderedItems.push({
        productId: item.productId,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        image: dbProduct.image
      });
    }

    // Create Order
    const newOrder = db.orders.create({
      userId: 'guest',
      userName: customerName,
      userPhone: customerPhone,
      userEmail: '',
      items: orderedItems,
      shippingAddress: {
        address: shippingLocation,
        phone: customerPhone
      },
      totalPrice: parseFloat(totalPrice),
      status: 'Pending'
    });

    // Send order confirmation email
    const itemsHtml = orderedItems.map(item => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${item.quantity}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailSubject = `New Order Booked - Infinity Jewls (Order #${newOrder.id})`;
    const emailText = `New guest order placed by ${newOrder.userName} (${newOrder.userPhone})! Order Details:\n` +
      orderedItems.map(item => `- ${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}`).join('\n') +
      `\nTotal: $${newOrder.totalPrice.toFixed(2)}\nShipping Address: ${shippingLocation}`;
    
    const emailHtml = `
      <div style="font-family:'Segoe UI',sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #d4af37;">
        <h2 style="color:#d4af37; text-align:center;">INFINITY JEWLS</h2>
        <h3>New Order Placed by ${newOrder.userName}!</h3>
        <p>Order ID: <strong>#${newOrder.id}</strong></p>
        <p>Customer Phone: <strong>${newOrder.userPhone}</strong></p>
        
        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
          <thead>
            <tr style="background-color:#f5f5f5;">
              <th style="padding:8px; border-bottom:2px solid #ddd; text-align:left;">Product</th>
              <th style="padding:8px; border-bottom:2px solid #ddd; text-align:center;">Qty</th>
              <th style="padding:8px; border-bottom:2px solid #ddd; text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align:right; margin-top:15px; font-size:18px; font-weight:bold;">
          Total: <span style="color:#d4af37;">$${newOrder.totalPrice.toFixed(2)}</span>
        </div>
        
        <div style="margin-top:25px; border-top:1px solid #ddd; padding-top:15px;">
          <h4>Shipping Address:</h4>
          <p>${shippingLocation}<br>Phone: ${customerPhone}</p>
        </div>
      </div>
    `;

    // Send email to admin asynchronously
    const adminEmail = process.env.RECEIVER_EMAIL || 'admin@infinityjewls.com';
    sendMail({
      to: adminEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(201).json({
      ...newOrder,
      adminWhatsApp: process.env.ADMIN_WHATSAPP || '919392073910'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order.', error: error.message });
  }
});

// Get Current User's Orders
router.get('/my-orders', auth, (req, res) => {
  try {
    const orders = db.orders.find({ userId: req.user.id });
    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your orders.', error: error.message });
  }
});

// Get All Orders (Admin only)
router.get('/admin/all', auth, admin, (req, res) => {
  try {
    const orders = db.orders.find();
    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders.', error: error.message });
  }
});

// Update Order Status (Admin only)
router.put('/:id/status', auth, admin, (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const order = db.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const updated = db.orders.updateById(req.params.id, { status });

    // Send status update notification email
    const subject = `Order #${order.id} Status Updated - Infinity Jewls`;
    const text = `Dear ${order.userName},\nThe status of your order #${order.id} has been updated to: ${status}.\nThank you for shopping with us!`;
    const html = `
      <div style="font-family:'Segoe UI',sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #d4af37;">
        <h2 style="color:#d4af37; text-align:center;">INFINITY JEWLS</h2>
        <h3>Dear ${order.userName},</h3>
        <p>The status of your order <strong>#${order.id}</strong> has been updated to:</p>
        <div style="background-color:#f9f9f9; padding:15px; border-left:4px solid #d4af37; font-size:18px; font-weight:bold; color:#d4af37; text-align:center; margin:20px 0;">
          ${status.toUpperCase()}
        </div>
        <p>We are working hard to get your items to you. Thank you for your patience and for choosing Infinity Jewls.</p>
      </div>
    `;

    sendMail({
      to: order.userEmail,
      subject,
      text,
      html
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status.', error: error.message });
  }
});

module.exports = router;
