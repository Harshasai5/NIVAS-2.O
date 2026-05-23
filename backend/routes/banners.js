import express from 'express';
import pool from '../config/db.js';
import { verifyAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper to delete an image file if it exists
const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.resolve('..', relativePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`⚠️ Failed to delete file: ${fullPath}`, err);
    }
  });
};

// GET all banners
// Clients: get only active banners sorted by display_order
// Admin: GET /api/banners?admin=true to get all banners including inactive ones
router.get('/', async (req, res) => {
  const isAdmin = req.query.admin === 'true';
  try {
    let query = 'SELECT * FROM banners ORDER BY display_order ASC, id DESC';
    if (!isAdmin) {
      query = "SELECT * FROM banners WHERE status = 'active' ORDER BY display_order ASC, id DESC";
    }
    const [banners] = await pool.query(query);
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create banner (admin only, uploads 1 banner_image)
router.post('/', verifyAdmin, upload.single('banner_image'), async (req, res) => {
  const { title, redirect_link, display_order, status } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Banner image is required.' });
  }

  // Format the image path identically to database seeding (e.g. Uploads/Banners/1716492323.jpg)
  const banner_image = `Uploads/Banners/${req.file.filename}`;
  const order = display_order ? parseInt(display_order) : 0;
  const activeStatus = status || 'active';

  try {
    const [result] = await pool.query(
      'INSERT INTO banners (title, banner_image, redirect_link, display_order, status) VALUES (?, ?, ?, ?, ?)',
      [title || '', banner_image, redirect_link || '#', order, activeStatus]
    );

    const [newBanner] = await pool.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    res.status(201).json(newBanner[0]);
  } catch (error) {
    // Clean up uploaded file on error
    deleteFile(banner_image);
    res.status(500).json({ error: error.message });
  }
});

// PUT update banner (admin only, optionally uploads a new banner_image)
router.put('/:id', verifyAdmin, upload.single('banner_image'), async (req, res) => {
  const { id } = req.params;
  const { title, redirect_link, display_order, status } = req.body;

  try {
    // Get existing banner to clean up old image if a new one is uploaded
    const [existing] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);
    if (existing.length === 0) {
      if (req.file) deleteFile(`Uploads/Banners/${req.file.filename}`);
      return res.status(404).json({ error: 'Banner not found.' });
    }

    let banner_image = existing[0].banner_image;
    if (req.file) {
      // Delete old banner image
      deleteFile(existing[0].banner_image);
      banner_image = `Uploads/Banners/${req.file.filename}`;
    }

    const order = display_order !== undefined ? parseInt(display_order) : existing[0].display_order;
    const activeStatus = status || existing[0].status;

    await pool.query(
      'UPDATE banners SET title = ?, banner_image = ?, redirect_link = ?, display_order = ?, status = ? WHERE id = ?',
      [title !== undefined ? title : existing[0].title, banner_image, redirect_link !== undefined ? redirect_link : existing[0].redirect_link, order, activeStatus, id]
    );

    const [updatedBanner] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);
    res.json(updatedBanner[0]);
  } catch (error) {
    if (req.file) deleteFile(`Uploads/Banners/${req.file.filename}`);
    res.status(500).json({ error: error.message });
  }
});

// DELETE banner (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Banner not found.' });
    }

    // Delete image file
    deleteFile(existing[0].banner_image);

    await pool.query('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ success: true, message: 'Banner deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
