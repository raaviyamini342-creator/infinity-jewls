import React, { useState } from 'react';
import { API_URL } from '../config';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Submission States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name || !email || !subject || !message) {
      setError('Please fill in all the contact form fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(data.message || 'Inquiry submitted successfully!');

      // Open WhatsApp pre-filled inquiry details
      const whatsappText = `✉️ *INFINITY JEWLS - CONTACT INQUIRY* ✉️\n\n` +
        `*Name:* ${name}\n` +
        `*Email:* ${email}\n` +
        `*Subject:* ${subject}\n\n` +
        `*Message:* \n${message}`;

      const whatsappLink = `https://api.whatsapp.com/send?phone=919392073910&text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappLink, '_blank');

      // Clear fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <div className="luxury-divider"></div>
        <p>Get in touch with our luxury consultants. We are here to assist you with bespoke requests.</p>
      </div>

      <div className="contact-grid">
        
        {/* Contact Info column */}
        <div className="contact-info-column">
          <h2>Bespoke Services</h2>
          <p className="contact-info-intro">Whether you require assistance selecting an engagement ring or custom sizing a bracelet, our client advisers are available to consult with you.</p>
          
          <div className="contact-details-list">
            <div className="contact-info-item">
              <Phone size={20} />
              <div>
                <h4>Call Us</h4>
                <p>+91 93920 73910</p>
                <span>Mon-Sat: 9:00 AM - 8:00 PM IST</span>
              </div>
            </div>

            <div className="contact-info-item">
              <Mail size={20} />
              <div>
                <h4>Email Us</h4>
                <p>praghnesh8764@gmail.com</p>
                <span>For general inquiries or custom orders.</span>
              </div>
            </div>

            <div className="contact-info-item">
              <svg fill="#25D366" viewBox="0 0 24 24" width="20" height="20" style={{ marginTop: '3px' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <h4>WhatsApp Us</h4>
                <p>
                  <a 
                    href="https://api.whatsapp.com/send?phone=919392073910&text=Hello%20Infinity%20Jewls!" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#25d366', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    +91 93920 73910
                  </a>
                </p>
                <span>Tap to chat instantly on WhatsApp</span>
              </div>
            </div>

            <div className="contact-info-item">
              <MapPin size={20} />
              <div>
                <h4>Our Salon</h4>
                <p>Visakhapatnam</p>
                <p>Andhra Pradesh, India</p>
                <span>By appointment only.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form column */}
        <div className="contact-form-column">
          <h2>Send Us an Inquiry</h2>
          
          {success && (
            <div className="contact-success-alert">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="contact-error-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input 
                type="text" 
                placeholder="How can we assist you?" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea 
                rows="6" 
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="contact-submit-btn" 
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <Send size={16} />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Contact;
