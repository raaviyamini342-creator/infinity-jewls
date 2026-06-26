const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'data', 'simulated_emails.log');

// Setup transporter (use SMTP if provided, otherwise log to local file)
let transporter = null;

const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

if (hasSMTPConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Nodemailer SMTP transporter initialized.');
} else {
  console.log('No SMTP config found. Initializing email logger (emails will save to server/data/simulated_emails.log).');
}

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.SMTP_USER || '"Infinity Jewls" <noreply@infinityjewls.com>',
    to: to || process.env.RECEIVER_EMAIL || 'admin@infinityjewls.com',
    subject,
    text,
    html,
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('SMTP Email sending error:', error);
      logSimulatedEmail(mailOptions, `SMTP Error: ${error.message}`);
      return false;
    }
  } else {
    logSimulatedEmail(mailOptions, 'SIMULATED (No SMTP Configured)');
    return true;
  }
};

function logSimulatedEmail(options, status) {
  const emailLog = `
========================================
[${new Date().toISOString()}] EMAIL STATUS: ${status}
From: ${options.from}
To: ${options.to}
Subject: ${options.subject}
----------------------------------------
TEXT CONTENT:
${options.text}
========================================
\n`;

  try {
    fs.appendFileSync(LOG_FILE, emailLog, 'utf8');
    console.log(`[Email Simulator] Email logged successfully to simulated_emails.log (Subject: "${options.subject}")`);
  } catch (error) {
    console.error('Error logging simulated email:', error);
  }
}

module.exports = { sendMail };
