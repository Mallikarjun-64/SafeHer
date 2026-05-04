require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin initialized with Service Account Key');
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'womensafety-de4aa'
    });
    console.log('🔥 Firebase Admin initialized with Project ID (Fallback)');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// SOS Emergency Endpoint
app.post('/api/sos', async (req, res) => {
  const { userId, userName, location } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  console.log(`🚨 SOS Alert triggered by ${userName || userId}`);

  try {
    // 1. Fetch guardians from Firestore
    const guardiansSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('guardians')
      .get();

    if (guardiansSnapshot.empty) {
      console.log('ℹ️ No guardians found for user');
      return res.json({ success: true, message: 'Alert logged, but no guardians to notify' });
    }

    const guardians = [];
    guardiansSnapshot.forEach(doc => guardians.push({ id: doc.id, ...doc.data() }));

    // 2. Prepare email content
    const locationStr = location ? `${location.lat}, ${location.lng}` : 'Unknown';
    const mapsLink = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : '';
    
    const emailPromises = guardians.map(guardian => {
      if (!guardian.email) return Promise.resolve();

      const mailOptions = {
        from: `"SafeHer Emergency" <${process.env.GMAIL_USER}>`,
        to: guardian.email,
        subject: `🚨 SOS EMERGENCY: ${userName || 'A user'} needs help!`,
        text: `SOS! ${userName || 'A user'} has triggered an emergency alert!\n\nLocation: ${locationStr}\n${mapsLink ? `View on Map: ${mapsLink}\n` : ''}\nPlease check on them immediately!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 8px;">
            <h2 style="color: #ef4444;">🚨 SOS EMERGENCY ALERT</h2>
            <p><strong>${userName || 'A user'}</strong> has triggered an emergency alert and needs immediate help!</p>
            <p><strong>Location:</strong> ${locationStr}</p>
            ${mapsLink ? `<p><a href="${mapsLink}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Live Location on Maps</a></p>` : ''}
            <hr />
            <p style="font-size: 12px; color: #666;">This is an automated emergency notification from SafeHer Guardian Angel Alert system.</p>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    // 3. Send all emails
    await Promise.all(emailPromises);
    console.log(`✅ SOS Emails sent to ${guardians.length} guardians`);

    res.json({ success: true, message: `SOS Alert sent to ${guardians.length} guardians` });

  } catch (error) {
    console.error('❌ SOS Alert processing error:', error);
    res.status(500).json({ success: false, message: 'Failed to process SOS alert', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SafeHer Service is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SafeHer Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
