import express from 'express';
import pool from '../config/db.js';
import { verifyAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper to delete an image file if it exists
const deleteFile = (relativePath) => {
  if (!relativePath || relativePath.startsWith('http')) return; // Ignore Cloudinary CDN URLs
  const fullPath = path.resolve('..', relativePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`⚠️ Failed to delete file: ${fullPath}`, err);
    }
  });
};

// Helper to parse JSON fields safely
const parseHostel = (hostel) => {
  if (!hostel) return hostel;
  try {
    hostel.facilities = hostel.facilities_json ? 
      (typeof hostel.facilities_json === 'string' ? JSON.parse(hostel.facilities_json) : hostel.facilities_json) 
      : [];
  } catch (e) {
    hostel.facilities = [];
  }
  try {
    hostel.rules = hostel.rules_json ? 
      (typeof hostel.rules_json === 'string' ? JSON.parse(hostel.rules_json) : hostel.rules_json) 
      : [];
  } catch (e) {
    hostel.rules = [];
  }
  try {
    hostel.roomOptions = hostel.room_options_json ? 
      (typeof hostel.room_options_json === 'string' ? JSON.parse(hostel.room_options_json) : hostel.room_options_json) 
      : [];
  } catch (e) {
    hostel.roomOptions = [];
  }
  delete hostel.facilities_json;
  delete hostel.rules_json;
  delete hostel.room_options_json;
  return hostel;
};

// GET all hostels with filters
router.get('/', async (req, res) => {
  const { 
    admin, 
    gender, 
    is_ac, 
    price_min, 
    price_max, 
    beds_per_room,
    sponsored, 
    college,
    available_only, 
    limit 
  } = req.query;

  const isAdmin = admin === 'true';

  try {
    let query = `
      SELECT 
        h.id, 
        h.hostel_name, 
        h.gender, 
        h.price_starting, 
        h.is_ac, 
        h.beds_per_room, 
        h.address, 
        h.available_beds, 
        h.total_beds, 
        h.sponsor_order, 
        h.is_college_hostel, 
        h.status, 
        h.facilities_json,
        hp.photo AS primary_photo 
      FROM hostels h
      LEFT JOIN hostel_photos hp ON h.id = hp.hostel_id AND hp.is_primary = 1
      WHERE 1=1
    `;
    const params = [];

    // Filter status for clients
    if (!isAdmin) {
      query += " AND h.status = 'active'";
    }

    // Gender filter
    if (gender) {
      query += " AND h.gender = ?";
      params.push(gender);
    }

    // AC filter
    if (is_ac !== undefined) {
      query += " AND h.is_ac = ?";
      params.push(parseInt(is_ac));
    }

    // College filter
    if (college !== undefined) {
      query += " AND h.is_college_hostel = ?";
      params.push(college === 'true' || college === '1' || college === 1 ? 1 : 0);
    }

    // Beds sharing filter
    if (beds_per_room) {
      query += " AND h.beds_per_room = ?";
      params.push(parseInt(beds_per_room));
    }

    // Price range filters
    if (price_min) {
      query += " AND h.price_starting >= ?";
      params.push(parseFloat(price_min));
    }
    if (price_max) {
      query += " AND h.price_starting <= ?";
      params.push(parseFloat(price_max));
    }

    // Available only filter
    if (available_only === 'true') {
      query += " AND h.available_beds > 0";
    }

    // Sponsored only filter
    if (sponsored === 'true') {
      query += " AND h.sponsor_order > 0";
    }

    // Sorting: Sponsored first, then by sponsor_order, then newest
    if (sponsored === 'true') {
      query += " ORDER BY h.sponsor_order ASC, h.id DESC";
    } else {
      query += " ORDER BY h.sponsor_order > 0 DESC, h.sponsor_order ASC, h.id DESC";
    }

    // Limit records
    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit));
    }

    const [rows] = await pool.query(query, params);
    const parsedHostels = rows.map(hostel => parseHostel(hostel));
    res.json(parsedHostels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single hostel detail (public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [hostels] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
    if (hostels.length === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }

    const [photos] = await pool.query(
      'SELECT * FROM hostel_photos WHERE hostel_id = ? ORDER BY is_primary DESC, id ASC',
      [id]
    );

    const hostel = parseHostel(hostels[0]);
    hostel.photos = photos;

    res.json(hostel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create hostel (admin only, handles multiple files up to 10)
router.post('/', verifyAdmin, upload.array('photos', 10), async (req, res) => {
  const {
    hostel_name,
    gender,
    price_starting,
    is_ac,
    beds_per_room,
    phone,
    google_maps_link,
    address,
    facilities, // Array or stringified JSON
    rules, // Array or stringified JSON
    roomOptions, // Array or stringified JSON
    sponsor_order,
    is_college_hostel,
    available_beds,
    total_beds,
    status
  } = req.body;

  if (!hostel_name || !gender || !price_starting || !phone) {
    // Delete uploaded files on request error
    if (req.files) {
      req.files.forEach(file => deleteFile(`Uploads/Hostels/${file.filename}`));
    }
    return res.status(400).json({ error: 'Hostel name, gender, starting price, and contact number are required.' });
  }

  // Format JSON fields properly
  let facilities_json = '[]';
  let rules_json = '[]';
  let room_options_json = '[]';

  try {
    facilities_json = typeof facilities === 'string' ? facilities : JSON.stringify(facilities || []);
    rules_json = typeof rules === 'string' ? rules : JSON.stringify(rules || []);
    room_options_json = typeof roomOptions === 'string' ? roomOptions : JSON.stringify(roomOptions || []);
  } catch (e) {
    console.error('JSON stringify error during creation', e);
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO hostels 
       (hostel_name, gender, price_starting, is_ac, beds_per_room, phone, google_maps_link, address, facilities_json, rules_json, sponsor_order, is_college_hostel, available_beds, total_beds, status, room_options_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hostel_name,
        gender,
        parseFloat(price_starting),
        is_ac === 'true' || is_ac === '1' ? 1 : 0,
        parseInt(beds_per_room || '1'),
        phone,
        google_maps_link || '',
        address || '',
        facilities_json,
        rules_json,
        sponsor_order ? parseInt(sponsor_order) : 0,
        is_college_hostel === 'true' || is_college_hostel === '1' || is_college_hostel === 1 || is_college_hostel === true ? 1 : 0,
        available_beds ? parseInt(available_beds) : 0,
        total_beds ? parseInt(total_beds) : 0,
        status || 'active',
        room_options_json
      ]
    );

    const hostelId = result.insertId;

    // Handle uploaded photos
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const secureUrl = await uploadToCloudinary(req.files[i].path, 'hostels');
        const isPrimary = i === 0 ? 1 : 0; // Mark the first photo as primary
        await conn.query(
          'INSERT INTO hostel_photos (hostel_id, photo, is_primary) VALUES (?, ?, ?)',
          [hostelId, secureUrl, isPrimary]
        );
      }
    }

    await conn.commit();
    conn.release();

    // Fetch the newly created hostel with photos
    const [newHostels] = await pool.query('SELECT * FROM hostels WHERE id = ?', [hostelId]);
    const [photos] = await pool.query('SELECT * FROM hostel_photos WHERE hostel_id = ?', [hostelId]);
    const hostel = parseHostel(newHostels[0]);
    hostel.photos = photos;

    res.status(201).json(hostel);
  } catch (error) {
    await conn.rollback();
    conn.release();
    if (req.files) {
      req.files.forEach(file => deleteFile(`Uploads/Hostels/${file.filename}`));
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT update hostel (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    hostel_name,
    gender,
    price_starting,
    is_ac,
    beds_per_room,
    phone,
    google_maps_link,
    address,
    facilities,
    rules,
    roomOptions,
    sponsor_order,
    is_college_hostel,
    available_beds,
    total_beds,
    status
  } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }

    let facilities_json = existing[0].facilities_json;
    let rules_json = existing[0].rules_json;
    let room_options_json = existing[0].room_options_json;

    if (facilities !== undefined) {
      facilities_json = typeof facilities === 'string' ? facilities : JSON.stringify(facilities);
    }
    if (rules !== undefined) {
      rules_json = typeof rules === 'string' ? rules : JSON.stringify(rules);
    }
    if (roomOptions !== undefined) {
      room_options_json = typeof roomOptions === 'string' ? roomOptions : JSON.stringify(roomOptions);
    }

    await pool.query(
      `UPDATE hostels SET 
        hostel_name = ?, 
        gender = ?, 
        price_starting = ?, 
        is_ac = ?, 
        beds_per_room = ?, 
        phone = ?, 
        google_maps_link = ?, 
        address = ?, 
        facilities_json = ?, 
        rules_json = ?, 
        sponsor_order = ?, 
        is_college_hostel = ?, 
        available_beds = ?, 
        total_beds = ?, 
        status = ?,
        room_options_json = ? 
      WHERE id = ?`,
      [
        hostel_name !== undefined ? hostel_name : existing[0].hostel_name,
        gender !== undefined ? gender : existing[0].gender,
        price_starting !== undefined ? parseFloat(price_starting) : existing[0].price_starting,
        is_ac !== undefined ? (is_ac === 'true' || is_ac === '1' || is_ac === 1 ? 1 : 0) : existing[0].is_ac,
        beds_per_room !== undefined ? parseInt(beds_per_room) : existing[0].beds_per_room,
        phone !== undefined ? phone : existing[0].phone,
        google_maps_link !== undefined ? google_maps_link : existing[0].google_maps_link,
        address !== undefined ? address : existing[0].address,
        facilities_json,
        rules_json,
        sponsor_order !== undefined ? parseInt(sponsor_order) : existing[0].sponsor_order,
        is_college_hostel !== undefined ? (is_college_hostel === 'true' || is_college_hostel === '1' || is_college_hostel === 1 || is_college_hostel === true ? 1 : 0) : existing[0].is_college_hostel,
        available_beds !== undefined ? parseInt(available_beds) : existing[0].available_beds,
        total_beds !== undefined ? parseInt(total_beds) : existing[0].total_beds,
        status !== undefined ? status : existing[0].status,
        room_options_json,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
    res.json(parseHostel(updated[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload photos to existing hostel (admin only)
router.post('/:id/photos', verifyAdmin, upload.array('photos', 10), async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
    if (existing.length === 0) {
      if (req.files) {
        req.files.forEach(file => deleteFile(`Uploads/Hostels/${file.filename}`));
      }
      return res.status(404).json({ error: 'Hostel not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Check if the hostel already has a primary photo
    const [primaryPhoto] = await pool.query('SELECT id FROM hostel_photos WHERE hostel_id = ? AND is_primary = 1', [id]);
    const hasPrimary = primaryPhoto.length > 0;

    const insertedPhotos = [];
    for (let i = 0; i < req.files.length; i++) {
      const secureUrl = await uploadToCloudinary(req.files[i].path, 'hostels');
      // If there is no existing primary, make the first uploaded photo primary
      const isPrimary = (!hasPrimary && i === 0) ? 1 : 0;

      const [result] = await pool.query(
        'INSERT INTO hostel_photos (hostel_id, photo, is_primary) VALUES (?, ?, ?)',
        [id, secureUrl, isPrimary]
      );
      
      insertedPhotos.push({
        id: result.insertId,
        hostel_id: parseInt(id),
        photo: secureUrl,
        is_primary: isPrimary
      });
    }

    res.json(insertedPhotos);
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(`Uploads/Hostels/${file.filename}`));
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT set photo as primary (admin only)
router.put('/:id/photos/:photoId/primary', verifyAdmin, async (req, res) => {
  const { id, photoId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify photo belongs to hostel
    const [photo] = await conn.query('SELECT * FROM hostel_photos WHERE id = ? AND hostel_id = ?', [photoId, id]);
    if (photo.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Photo not found for this hostel.' });
    }

    // Set all photos for this hostel to non-primary
    await conn.query('UPDATE hostel_photos SET is_primary = 0 WHERE hostel_id = ?', [id]);
    
    // Set selected photo to primary
    await conn.query('UPDATE hostel_photos SET is_primary = 1 WHERE id = ?', [photoId]);

    await conn.commit();
    conn.release();

    res.json({ success: true, message: 'Photo marked as primary successfully.' });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ error: error.message });
  }
});

// DELETE single photo (admin only)
router.delete('/photos/:photoId', verifyAdmin, async (req, res) => {
  const { photoId } = req.params;

  try {
    const [photo] = await pool.query('SELECT * FROM hostel_photos WHERE id = ?', [photoId]);
    if (photo.length === 0) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Delete image file from storage
    deleteFile(photo[0].photo);

    // Delete record
    await pool.query('DELETE FROM hostel_photos WHERE id = ?', [photoId]);

    // If we deleted the primary photo, assign a new primary if there are other photos left
    if (photo[0].is_primary === 1) {
      const [remaining] = await pool.query(
        'SELECT id FROM hostel_photos WHERE hostel_id = ? ORDER BY id ASC LIMIT 1',
        [photo[0].hostel_id]
      );
      if (remaining.length > 0) {
        await pool.query('UPDATE hostel_photos SET is_primary = 1 WHERE id = ?', [remaining[0].id]);
      }
    }

    res.json({ success: true, message: 'Photo deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE whole hostel (admin only - cascades database records, manually deletes physical files)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Get all photos associated with the hostel to delete files from disk
    const [photos] = await pool.query('SELECT photo FROM hostel_photos WHERE hostel_id = ?', [id]);
    
    // Delete each image file from disk
    photos.forEach(p => deleteFile(p.photo));

    // Delete hostel (this automatically deletes hostel_photos via database FOREIGN KEY ON DELETE CASCADE constraint)
    const [result] = await pool.query('DELETE FROM hostels WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }

    res.json({ success: true, message: 'Hostel and all its images deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST click counter increment
router.post('/:id/click', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE hostels SET clicks = clicks + 1 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }
    res.json({ success: true, message: 'Hostel click tracked successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
