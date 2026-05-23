import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import adminRouter, { seedDefaultAdmin } from './routes/admin.js';
import bannersRouter from './routes/banners.js';
import hostelsRouter from './routes/hostels.js';
import roomsRouter from './routes/rooms.js';

dotenv.config();

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

// Health Check / Default Route
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
