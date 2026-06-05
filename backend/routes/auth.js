import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();

  if (!trimmedEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (password.length < 5) {
    return res.status(400).json({ error: 'Password must be at least 5 characters long.' });
  }

  try {
    // Check if email already registered
    const [existingEmail] = await pool.query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Check if username already taken
    const [existingUsername] = await pool.query('SELECT * FROM users WHERE username = ?', [trimmedUsername]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [trimmedUsername, trimmedEmail, hashedPassword]
    );
    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { userId, username: trimmedUsername, email: trimmedEmail },
      process.env.JWT_SECRET || 'nivas_super_secret_key_123!',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, username: trimmedUsername, email: trimmedEmail },
      message: 'Registered and logged in successfully.'
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ error: 'Failed to register. Please try again.' });
  }
});

// POST /api/auth/login - Login existing user
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required.' });
  }

  const trimmedIdentifier = usernameOrEmail.trim();

  try {
    // Find user by username or email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [trimmedIdentifier, trimmedIdentifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const user = rows[0];

    // If password is not set (e.g. user registered before via direct OTP bypass)
    if (!user.password) {
      return res.status(401).json({ error: 'Password login is not configured for this account. Please register again.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'nivas_super_secret_key_123!',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username || user.email.split('@')[0], email: user.email },
      message: 'Logged in successfully.'
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ error: 'Failed to authenticate. Please try again.' });
  }
});

// Helper to parse JSON fields safely for likes
const parseHostel = (hostel) => {
  if (!hostel) return hostel;
  try {
    hostel.facilities = hostel.facilities_json ? 
      (typeof hostel.facilities_json === 'string' ? JSON.parse(hostel.facilities_json) : hostel.facilities_json) 
      : [];
  } catch (e) {
    hostel.facilities = [];
  }
  delete hostel.facilities_json;
  return hostel;
};

const parseRoom = (room) => {
  if (!room) return room;
  try {
    room.facilities = room.facilities_json ? 
      (typeof room.facilities_json === 'string' ? JSON.parse(room.facilities_json) : room.facilities_json) 
      : [];
  } catch (e) {
    room.facilities = [];
  }
  delete room.facilities_json;
  return room;
};

// GET /api/auth/likes - Retrieve liked hostels and rooms for the authenticated user
router.get('/likes', verifyUser, async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1. Fetch liked hostels
    const [hostelRows] = await pool.query(`
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
        h.facilities_json,
        hp.photo AS primary_photo,
        (SELECT COUNT(*) FROM user_interactions WHERE item_id = h.id AND item_type = 'hostel' AND interaction_type = 'like') AS likes_count,
        1 AS is_liked
      FROM hostels h
      LEFT JOIN hostel_photos hp ON h.id = hp.hostel_id AND hp.is_primary = 1
      INNER JOIN user_interactions ui ON ui.item_id = h.id AND ui.item_type = 'hostel' AND ui.interaction_type = 'like'
      WHERE ui.user_id = ? AND h.status = 'active'
      ORDER BY ui.created_at DESC
    `, [userId]);

    // 2. Fetch liked rooms
    const [roomRows] = await pool.query(`
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
        r.facilities_json,
        rp.photo AS primary_photo,
        (SELECT COUNT(*) FROM user_interactions WHERE item_id = r.id AND item_type = 'room' AND interaction_type = 'like') AS likes_count,
        1 AS is_liked
      FROM rooms r
      LEFT JOIN room_photos rp ON r.id = rp.room_id AND rp.is_primary = 1
      INNER JOIN user_interactions ui ON ui.item_id = r.id AND ui.item_type = 'room' AND ui.interaction_type = 'like'
      WHERE ui.user_id = ? AND r.status = 'active'
      ORDER BY ui.created_at DESC
    `, [userId]);

    const hostels = hostelRows.map(h => parseHostel(h));
    const rooms = roomRows.map(r => parseRoom(r));

    res.json({
      success: true,
      hostels,
      rooms
    });
  } catch (error) {
    console.error('Error fetching liked items:', error);
    res.status(500).json({ error: 'Failed to retrieve liked hostels and rooms.' });
  }
});

export default router;
