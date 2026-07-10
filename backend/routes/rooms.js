import express from 'express';
import pool from '../config/db.js';
import { verifyAdmin, verifyUser, optionalUser } from '../middleware/auth.js';
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
const parseRoom = (room) => {
  if (!room) return room;
  try {
    room.facilities = room.facilities_json ? 
      (typeof room.facilities_json === 'string' ? JSON.parse(room.facilities_json) : room.facilities_json) 
      : [];
  } catch (e) {
    room.facilities = [];
  }
  try {
    room.rules = room.rules_json ? 
      (typeof room.rules_json === 'string' ? JSON.parse(room.rules_json) : room.rules_json) 
      : [];
  } catch (e) {
    room.rules = [];
  }
  try {
    room.roomOptions = room.room_options_json ? 
      (typeof room.room_options_json === 'string' ? JSON.parse(room.room_options_json) : room.room_options_json) 
      : [];
  } catch (e) {
    room.roomOptions = [];
  }
  delete room.facilities_json;
  delete room.rules_json;
  delete room.room_options_json;
  return room;
};

// GET all rooms with filters
router.get('/', optionalUser, async (req, res) => {
  const { 
    admin, 
    gender, 
    is_ac, 
    price_min, 
    price_max, 
    distance_max, 
    beds_per_room,
    available_only, 
    limit,
    associated_college
  } = req.query;

  const isAdmin = admin === 'true';
  const userId = req.user ? req.user.userId : null;

  try {
    let query = `
      SELECT 
        r.id, 
        r.room_name, 
        r.gender, 
        r.price_per_person, 
        r.is_ac, 
        r.beds_per_room, 
        r.address, 
        r.available_beds, 
        r.total_beds, 
        r.distance_from_srkr, 
        r.status, 
        r.facilities_json,
        r.associated_college,
        rp.photo AS primary_photo,
        (SELECT COUNT(*) FROM user_interactions WHERE item_id = r.id AND item_type = 'room' AND interaction_type = 'like') AS likes_count,
        ? IS NOT NULL AND EXISTS(SELECT 1 FROM user_interactions WHERE item_id = r.id AND item_type = 'room' AND user_id = ? AND interaction_type = 'like') AS is_liked
      FROM rooms r
      LEFT JOIN room_photos rp ON r.id = rp.room_id AND rp.is_primary = 1
      WHERE 1=1
    `;
    const params = [userId, userId];

    // Filter status for clients
    if (!isAdmin) {
      query += " AND r.status = 'active'";
    }

    // Gender filter (supports boys, girls, unisex)
    if (gender) {
      query += " AND r.gender = ?";
      params.push(gender);
    }

    // AC filter
    if (is_ac !== undefined) {
      query += " AND r.is_ac = ?";
      params.push(parseInt(is_ac));
    }

    // Price range filters (uses price_per_person)
    if (price_min) {
      query += " AND r.price_per_person >= ?";
      params.push(parseFloat(price_min));
    }
    if (price_max) {
      query += " AND r.price_per_person <= ?";
      params.push(parseFloat(price_max));
    }

    // Distance from SRKR filter
    if (distance_max) {
      query += " AND r.distance_from_srkr <= ?";
      params.push(parseFloat(distance_max));
    }

    // Beds per room sharing filter
    if (beds_per_room) {
      query += " AND r.beds_per_room = ?";
      params.push(parseInt(beds_per_room));
    }

    // Associated college name filter
    if (associated_college) {
      query += " AND r.associated_college = ?";
      params.push(associated_college);
    }

    // Available only filter
    if (available_only === 'true') {
      query += " AND r.available_beds > 0";
    }

    // Sorting: Newest rooms first, or distance first
    query += " ORDER BY r.distance_from_srkr ASC, r.id DESC";

    // Limit records
    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit));
    }

    const [rows] = await pool.query(query, params);
    const parsedRooms = rows.map(room => parseRoom(room));
    res.json(parsedRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET price bounds (public)
router.get('/price-bounds', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT MIN(price_per_person) AS minPrice, MAX(price_per_person) AS maxPrice FROM rooms WHERE status = "active"');
    res.json({
      minPrice: parseFloat(result[0].minPrice || 0),
      maxPrice: parseFloat(result[0].maxPrice || 10000)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single room detail (public)
router.get('/:id', optionalUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.userId : null;

  try {
    const [rooms] = await pool.query(`
      SELECT 
        r.*, 
        (SELECT COUNT(*) FROM user_interactions WHERE item_id = r.id AND item_type = 'room' AND interaction_type = 'like') AS likes_count,
        ? IS NOT NULL AND EXISTS(SELECT 1 FROM user_interactions WHERE item_id = r.id AND item_type = 'room' AND user_id = ? AND interaction_type = 'like') AS is_liked
      FROM rooms r 
      WHERE r.id = ?
    `, [userId, userId, id]);

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room / PG not found.' });
    }

    const [photos] = await pool.query(
      'SELECT * FROM room_photos WHERE room_id = ? ORDER BY is_primary DESC, id ASC',
      [id]
    );

    const room = parseRoom(rooms[0]);
    room.photos = photos;

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create room (admin only, handles multiple files up to 10)
router.post('/', verifyAdmin, upload.array('photos', 10), async (req, res) => {
  const {
    room_name,
    gender,
    price_per_person,
    is_ac,
    beds_per_room,
    filled_count,
    available_beds,
    total_beds,
    distance_from_srkr,
    phone,
    google_maps_link,
    address,
    facilities,
    rules,
    roomOptions,
    status,
    associated_college
  } = req.body;

  if (!room_name || !gender || !price_per_person || !phone) {
    // Delete uploaded files on request error
    if (req.files) {
      req.files.forEach(file => deleteFile(`Uploads/Rooms/${file.filename}`));
    }
    return res.status(400).json({ error: 'Room name, gender, price per person, and contact number are required.' });
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
      `INSERT INTO rooms 
       (room_name, gender, price_per_person, is_ac, beds_per_room, filled_count, available_beds, total_beds, distance_from_srkr, phone, google_maps_link, address, facilities_json, rules_json, status, room_options_json, associated_college) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room_name,
        gender,
        parseFloat(price_per_person),
        is_ac === 'true' || is_ac === '1' ? 1 : 0,
        parseInt(beds_per_room || '1'),
        parseInt(filled_count || '0'),
        parseInt(available_beds || '0'),
        parseInt(total_beds || '0'),
        distance_from_srkr ? parseFloat(distance_from_srkr) : null,
        phone,
        google_maps_link || '',
        address || '',
        facilities_json,
        rules_json,
        status || 'active',
        room_options_json,
        associated_college || 'SRKR Engineering'
      ]
    );

    const roomId = result.insertId;

    // Handle uploaded photos
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const secureUrl = await uploadToCloudinary(req.files[i].path, 'rooms');
        const isPrimary = i === 0 ? 1 : 0; // Mark the first photo as primary
        await conn.query(
          'INSERT INTO room_photos (room_id, photo, is_primary) VALUES (?, ?, ?)',
          [roomId, secureUrl, isPrimary]
        );
      }
    }

    await conn.commit();
    conn.release();

    // Fetch newly created room with photos
    const [newRooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    const [photos] = await pool.query('SELECT * FROM room_photos WHERE room_id = ?', [roomId]);
    const room = parseRoom(newRooms[0]);
    room.photos = photos;

    res.status(201).json(room);
  } catch (error) {
    await conn.rollback();
    conn.release();
    if (req.files) {
      req.files.forEach(file => deleteFile(`Uploads/Rooms/${file.filename}`));
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT update room (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    room_name,
    gender,
    price_per_person,
    is_ac,
    beds_per_room,
    filled_count,
    available_beds,
    total_beds,
    distance_from_srkr,
    phone,
    google_maps_link,
    address,
    facilities,
    rules,
    roomOptions,
    status,
    associated_college
  } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
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
      `UPDATE rooms SET 
        room_name = ?, 
        gender = ?, 
        price_per_person = ?, 
        is_ac = ?, 
        beds_per_room = ?, 
        filled_count = ?, 
        available_beds = ?, 
        total_beds = ?, 
        distance_from_srkr = ?, 
        phone = ?, 
        google_maps_link = ?, 
        address = ?, 
        facilities_json = ?, 
        rules_json = ?, 
        status = ?,
        room_options_json = ?,
        associated_college = ?
      WHERE id = ?`,
      [
        room_name !== undefined ? room_name : existing[0].room_name,
        gender !== undefined ? gender : existing[0].gender,
        price_per_person !== undefined ? parseFloat(price_per_person) : existing[0].price_per_person,
        is_ac !== undefined ? (is_ac === 'true' || is_ac === '1' || is_ac === 1 ? 1 : 0) : existing[0].is_ac,
        beds_per_room !== undefined ? parseInt(beds_per_room) : existing[0].beds_per_room,
        filled_count !== undefined ? parseInt(filled_count) : existing[0].filled_count,
        available_beds !== undefined ? parseInt(available_beds) : existing[0].available_beds,
        total_beds !== undefined ? parseInt(total_beds) : existing[0].total_beds,
        distance_from_srkr !== undefined ? (distance_from_srkr ? parseFloat(distance_from_srkr) : null) : existing[0].distance_from_srkr,
        phone !== undefined ? phone : existing[0].phone,
        google_maps_link !== undefined ? google_maps_link : existing[0].google_maps_link,
        address !== undefined ? address : existing[0].address,
        facilities_json,
        rules_json,
        status !== undefined ? status : existing[0].status,
        room_options_json,
        associated_college !== undefined ? associated_college : existing[0].associated_college,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    res.json(parseRoom(updated[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload photos to existing room (admin only)
router.post('/:id/photos', verifyAdmin, upload.array('photos', 10), async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      if (req.files) {
        req.files.forEach(file => deleteFile(`Uploads/Rooms/${file.filename}`));
      }
      return res.status(404).json({ error: 'Room not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Check if the room already has a primary photo
    const [primaryPhoto] = await pool.query('SELECT id FROM room_photos WHERE room_id = ? AND is_primary = 1', [id]);
    const hasPrimary = primaryPhoto.length > 0;

    const insertedPhotos = [];
    for (let i = 0; i < req.files.length; i++) {
      const secureUrl = await uploadToCloudinary(req.files[i].path, 'rooms');
      // If there is no existing primary, make the first uploaded photo primary
      const isPrimary = (!hasPrimary && i === 0) ? 1 : 0;

      const [result] = await pool.query(
        'INSERT INTO room_photos (room_id, photo, is_primary) VALUES (?, ?, ?)',
        [id, secureUrl, isPrimary]
      );
      
      insertedPhotos.push({
        id: result.insertId,
        room_id: parseInt(id),
        photo: secureUrl,
        is_primary: isPrimary
      });
    }

    res.json(insertedPhotos);
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(`Uploads/Rooms/${file.filename}`));
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

    // Verify photo belongs to room
    const [photo] = await conn.query('SELECT * FROM room_photos WHERE id = ? AND room_id = ?', [photoId, id]);
    if (photo.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Photo not found for this room.' });
    }

    // Set all photos for this room to non-primary
    await conn.query('UPDATE room_photos SET is_primary = 0 WHERE room_id = ?', [id]);
    
    // Set selected photo to primary
    await conn.query('UPDATE room_photos SET is_primary = 1 WHERE id = ?', [photoId]);

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
    const [photo] = await pool.query('SELECT * FROM room_photos WHERE id = ?', [photoId]);
    if (photo.length === 0) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Delete image file from storage
    deleteFile(photo[0].photo);

    // Delete record
    await pool.query('DELETE FROM room_photos WHERE id = ?', [photoId]);

    // If we deleted the primary photo, assign a new primary if there are other photos left
    if (photo[0].is_primary === 1) {
      const [remaining] = await pool.query(
        'SELECT id FROM room_photos WHERE room_id = ? ORDER BY id ASC LIMIT 1',
        [photo[0].room_id]
      );
      if (remaining.length > 0) {
        await pool.query('UPDATE room_photos SET is_primary = 1 WHERE id = ?', [remaining[0].id]);
      }
    }

    res.json({ success: true, message: 'Photo deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE whole room (admin only - cascades database records, manually deletes physical files)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Get all photos associated with the room to delete files from disk
    const [photos] = await pool.query('SELECT photo FROM room_photos WHERE room_id = ?', [id]);
    
    // Delete each image file from disk
    photos.forEach(p => deleteFile(p.photo));

    // Delete room (cascades database deletes via FOREIGN KEY ON DELETE CASCADE constraint)
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    res.json({ success: true, message: 'Room and all its images deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST click counter increment
router.post('/:id/click', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE rooms SET clicks = clicks + 1 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }
    res.json({ success: true, message: 'Room click tracked successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms/:id/like - Toggle room like status
router.post('/:id/like', verifyUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check if room exists
    const [rooms] = await pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Check if user already liked
    const [existing] = await pool.query(
      "SELECT id FROM user_interactions WHERE user_id = ? AND item_id = ? AND item_type = 'room' AND interaction_type = 'like'",
      [userId, id]
    );

    let liked = false;
    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM user_interactions WHERE user_id = ? AND item_id = ? AND item_type = 'room' AND interaction_type = 'like'",
        [userId, id]
      );
    } else {
      await pool.query(
        "INSERT INTO user_interactions (user_id, item_id, item_type, interaction_type) VALUES (?, ?, 'room', 'like')",
        [userId, id]
      );
      liked = true;
    }

    // Get updated count
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS likes_count FROM user_interactions WHERE item_id = ? AND item_type = 'room' AND interaction_type = 'like'",
      [id]
    );

    res.json({
      success: true,
      liked,
      likes_count: countResult[0].likes_count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms/:id/share - Log room share interaction
router.post('/:id/share', verifyUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check if room exists
    const [rooms] = await pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Log the share interaction
    await pool.query(
      "INSERT IGNORE INTO user_interactions (user_id, item_id, item_type, interaction_type) VALUES (?, ?, 'room', 'share')",
      [userId, id]
    );

    // Get updated count
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS shares_count FROM user_interactions WHERE item_id = ? AND item_type = 'room' AND interaction_type = 'share'",
      [id]
    );

    res.json({
      success: true,
      shares_count: countResult[0].shares_count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
