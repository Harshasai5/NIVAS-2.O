import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'nivas_2_0',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Test the connection and run migrations on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();

    // Schema migration: Clicks count columns for specific hostels/rooms
    const [hostelCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'clicks'");
    if (hostelCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN clicks INT DEFAULT 0");
      console.log("✨ Appended 'clicks' column to 'hostels' table successfully.");
    }

    const [roomCols] = await pool.query("SHOW COLUMNS FROM rooms LIKE 'clicks'");
    if (roomCols.length === 0) {
      await pool.query("ALTER TABLE rooms ADD COLUMN clicks INT DEFAULT 0");
      console.log("✨ Appended 'clicks' column to 'rooms' table successfully.");
    }

    // Schema migration: room_options_json columns for hostels
    const [hostelRoomOpt] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'room_options_json'");
    if (hostelRoomOpt.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN room_options_json TEXT DEFAULT NULL");
      console.log("✨ Appended 'room_options_json' column to 'hostels' table successfully.");
    }

    // Schema migration: room_options_json columns for rooms
    const [roomRoomOpt] = await pool.query("SHOW COLUMNS FROM rooms LIKE 'room_options_json'");
    if (roomRoomOpt.length === 0) {
      await pool.query("ALTER TABLE rooms ADD COLUMN room_options_json TEXT DEFAULT NULL");
      console.log("✨ Appended 'room_options_json' column to 'rooms' table successfully.");
    }
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    console.error('👉 Please make sure MySQL is running on', process.env.DB_HOST, 'and database', process.env.DB_NAME, 'exists.');
  }
}

testConnection();

export default pool;
