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

    const [hostelInstCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'installments'");
    if (hostelInstCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN installments INT DEFAULT 1");
      console.log("✨ Appended 'installments' column to 'hostels' table successfully.");
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

    // Schema migration: associated_college columns for hostels
    const [hostelCollCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'associated_college'");
    if (hostelCollCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN associated_college VARCHAR(255) DEFAULT 'SRKR Engineering'");
      console.log("✨ Appended 'associated_college' column to 'hostels' table successfully.");
    }

    // Schema migration: associated_college columns for rooms
    const [roomCollCols] = await pool.query("SHOW COLUMNS FROM rooms LIKE 'associated_college'");
    if (roomCollCols.length === 0) {
      await pool.query("ALTER TABLE rooms ADD COLUMN associated_college VARCHAR(255) DEFAULT 'SRKR Engineering'");
      console.log("✨ Appended 'associated_college' column to 'rooms' table successfully.");
    }

    // Ensure 'users' table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("✨ Verified 'users' table exists.");

    // Migrate users table with username and password columns
    const [userUsernameCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'username'");
    if (userUsernameCols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN username VARCHAR(255) DEFAULT NULL UNIQUE");
      console.log("✨ Appended 'username' column to 'users' table successfully.");
    }

    const [userPasswordCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'password'");
    if (userPasswordCols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) DEFAULT NULL");
      console.log("✨ Appended 'password' column to 'users' table successfully.");
    }

    // Ensure 'otp_codes' table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("✨ Verified 'otp_codes' table exists.");

    // Ensure 'user_interactions' table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        item_type ENUM('hostel', 'room') NOT NULL,
        interaction_type ENUM('like', 'share') NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_item_interaction (user_id, item_id, item_type, interaction_type),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("✨ Verified 'user_interactions' table exists.");

    // Migrate existing likes from old hostel_likes table if it still exists
    try {
      const [likesTable] = await pool.query("SHOW TABLES LIKE 'hostel_likes'");
      if (likesTable.length > 0) {
        console.log("✨ Migrating old 'hostel_likes' records to 'user_interactions'...");
        await pool.query(`
          INSERT IGNORE INTO user_interactions (user_id, item_id, item_type, interaction_type, created_at)
          SELECT user_id, hostel_id, 'hostel', 'like', created_at FROM hostel_likes
        `);
        await pool.query("DROP TABLE hostel_likes");
        console.log("✨ Dropped old 'hostel_likes' table successfully.");
      }
    } catch (err) {
      console.warn("⚠️ Failed to migrate or drop hostel_likes:", err.message);
    }
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    console.error('👉 Please make sure MySQL is running on', process.env.DB_HOST, 'and database', process.env.DB_NAME, 'exists.');
  }
}

testConnection();

export default pool;
