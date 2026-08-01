import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import adminRouter, { seedDefaultAdmin } from './routes/admin.js';
import bannersRouter from './routes/banners.js';
import hostelsRouter from './routes/hostels.js';
import roomsRouter from './routes/rooms.js';
import authRouter from './routes/auth.js';

dotenv.config();

// Configure Nodemailer GMail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nivasaccommodations@gmail.com',
    pass: process.env.EMAIL_PASS // GMail App Password (set in .env)
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder (NIVAS-2.O/Uploads) from workspace root
const uploadsPath = path.resolve('..', 'Uploads');
app.use('/Uploads', express.static(uploadsPath));
console.log(`📂 Static assets served from: ${uploadsPath}`);

// API Routes
app.use('/api/admin', adminRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/hostels', hostelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/auth', authRouter);

// Contact Message endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  console.log(`✉️ New Contact Message from ${name} (${email}): ${message}`);

  const mailOptions = {
    from: process.env.EMAIL_USER || 'nivasaccommodations@gmail.com',
    to: 'nivasaccommodations@gmail.com',
    replyTo: email,
    subject: `New Nivas Contact Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage/Question:\n${message}`
  };

  try {
    if (process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email successfully sent to nivasaccommodations@gmail.com`);
    } else {
      console.warn(`⚠️ EMAIL_PASS not set in .env. Email was logged but not sent via SMTP.`);
    }
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('💥 Failed to send email:', error);
    res.status(500).json({ error: 'Failed to send message via email.' });
  }
});

// Health Check endpoint for Keep-Alive pinger (cron-job.org)
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Nivas Finder Platform API.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} (http://localhost:${PORT})`);
  
  // Seed default admin (admin/admin123) if none exists in DB
  await seedDefaultAdmin();
});
