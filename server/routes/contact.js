const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, admin } = require('../middleware/auth');
const { sendMail } = require('../mailer');

// Submit Contact Message (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All contact fields are required.' });
    }

    const newMessage = db.messages.create({
      name,
      email: email.toLowerCase(),
      subject,
      message,
      read: false
    });

    // Send email alert to admin
    const emailSubject = `New Contact Form Submission: "${subject}"`;
    const emailText = `You received a new message on Infinity Jewls contact form:\n\n` +
      `From: ${name} (${email})\n` +
      `Subject: ${subject}\n\n` +
      `Message:\n${message}`;
    
    const emailHtml = `
      <div style="font-family:'Segoe UI',sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #d4af37;">
        <h2 style="color:#d4af37; text-align:center;">INFINITY JEWLS CONTACT INQUIRY</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color:#f9f9f9; padding:15px; border-left:4px solid #d4af37; margin:20px 0;">
          <p style="white-space:pre-line;">${message}</p>
        </div>
      </div>
    `;

    // sendMail is async, we do not await it so the response is fast
    sendMail({
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(201).json({ message: 'Message sent successfully. We will get back to you soon!', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit contact request.', error: error.message });
  }
});

// Get All Contact Messages (Admin only)
router.get('/messages', auth, admin, (req, res) => {
  try {
    const messages = db.messages.find();
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contact messages.', error: error.message });
  }
});

// Mark Message as Read (Admin only)
router.put('/messages/:id/read', auth, admin, (req, res) => {
  try {
    const message = db.messages.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    const updated = db.messages.updateById(req.params.id, { read: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message status.', error: error.message });
  }
});

module.exports = router;
