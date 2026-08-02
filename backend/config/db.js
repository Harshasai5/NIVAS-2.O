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

    // Schema migration: Alter beds_per_room in hostels to support multiple sharing options
    const [hostelBedsType] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'beds_per_room'");
    if (hostelBedsType.length > 0 && hostelBedsType[0].Type.toLowerCase().includes('int')) {
      await pool.query("ALTER TABLE hostels MODIFY COLUMN beds_per_room VARCHAR(255) NOT NULL DEFAULT '1'");
      console.log("✨ Migrated 'beds_per_room' in 'hostels' table to VARCHAR(255) successfully.");
    }

    const [hostelInstCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'installments'");
    if (hostelInstCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN installments INT DEFAULT 1");
      console.log("✨ Appended 'installments' column to 'hostels' table successfully.");
    }

    const [hostelDistCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'distance_from_srkr'");
    if (hostelDistCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN distance_from_srkr DECIMAL(4,2) DEFAULT 0.5");
      console.log("✨ Appended 'distance_from_srkr' column to 'hostels' table successfully.");
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

    // Schema migration: associated_college columns for banners
    const [bannerCollCols] = await pool.query("SHOW COLUMNS FROM banners LIKE 'associated_college'");
    if (bannerCollCols.length === 0) {
      await pool.query("ALTER TABLE banners ADD COLUMN associated_college VARCHAR(255) DEFAULT 'SRKR Engineering'");
      console.log("✨ Appended 'associated_college' column to 'banners' table successfully.");
    }

    // Schema migration: order columns for hostels
    const [hostelOrderCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'order'");
    if (hostelOrderCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN `order` INT DEFAULT 9999");
      console.log("✨ Appended 'order' column to 'hostels' table successfully.");

      // Set initial values for requested hostels
      await pool.query("UPDATE hostels SET `order` = 1 WHERE hostel_name LIKE '%Naresh Boys%'");
      await pool.query("UPDATE hostels SET `order` = 2 WHERE hostel_name LIKE '%Kusuma Sri Girls%' OR hostel_name LIKE '%Kusma sir%'");
      await pool.query("UPDATE hostels SET `order` = 3 WHERE hostel_name LIKE '%Vigneswara Boys%'");
      await pool.query("UPDATE hostels SET `order` = 4 WHERE hostel_name LIKE '%OM SAI BOYS%'");
      await pool.query("UPDATE hostels SET `order` = 5 WHERE hostel_name LIKE '%Vijaya Aditya Boys%'");
      await pool.query("UPDATE hostels SET `order` = 6 WHERE hostel_name LIKE '%Tatavarthy Boys%'");
      await pool.query("UPDATE hostels SET `order` = 7 WHERE hostel_name LIKE '%7 Hills Boys%'");
      await pool.query("UPDATE hostels SET `order` = 8 WHERE hostel_name LIKE '%P.V.R Girls%'");
      await pool.query("UPDATE hostels SET `order` = 9 WHERE hostel_name LIKE '%Sri Siva Bala Girls%'");
      console.log("✨ Initialized display orders for seeded hostels.");
    }

    // Perform bed sharing updates
    console.log("🛠️ Applying bed sharing updates to database...");
    await pool.query("UPDATE hostels SET beds_per_room = '2,3,4' WHERE hostel_name = 'Sri Vigneswara Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET beds_per_room = '1,2,3,4,5' WHERE hostel_name = 'Vijaya Aditya Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET beds_per_room = '3' WHERE hostel_name = 'Tatavarthy Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET beds_per_room = '4,5,6' WHERE hostel_name = '7 Hills Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET beds_per_room = '4' WHERE hostel_name = 'P.V.R Girls Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET beds_per_room = '4,5' WHERE hostel_name = 'Sri Siva Bala Girls hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET beds_per_room = '2,3,4,5,6' WHERE hostel_name = 'OM SAI BOYS HOSTEL' AND associated_college = 'SRKR Engineering'");
    
    await pool.query("UPDATE hostels SET beds_per_room = '2,3,4,5' WHERE hostel_name = 'Mitra Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET beds_per_room = '3,4' WHERE hostel_name = 'Vijaya Aditya Girls Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET beds_per_room = '3' WHERE hostel_name = 'Tatavarthy Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET beds_per_room = '4,5,6' WHERE hostel_name = '7 Hills Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET beds_per_room = '4,5' WHERE hostel_name = 'Aditya Tripura Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET beds_per_room = '2,3,4,5,6' WHERE hostel_name = 'OM SAI BOYS HOSTEL' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET beds_per_room = '3,4,5' WHERE hostel_name = 'Naresh Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    console.log("✨ Bed sharing updates applied successfully.");

    // Perform google maps link updates
    console.log("🛠️ Applying google maps link updates to database...");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/GQ7mn2EQ4aXG9yYo8' WHERE hostel_name = 'Sri Vigneswara Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/vPrzqYfej4BxHw8i9' WHERE hostel_name = 'Vijaya Aditya Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/TdNs6mZPGi8vTUR58' WHERE hostel_name = 'Tatavarthy Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/qPDDGCvqWpT2NBuk7?g_st=ac' WHERE hostel_name = '7 Hills Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/htsJ1c2y1sP27EcRA' WHERE hostel_name = 'P.V.R Girls Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/171M1tRiLW4ztPxG6' WHERE hostel_name = 'Sri Siva Bala Girls hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/3n7GQ97wZozzy3aB7' WHERE hostel_name = 'OM SAI BOYS HOSTEL' AND associated_college = 'SRKR Engineering'");
    
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/KtA66cC5WEEKUXeT8' WHERE hostel_name = 'Mitra Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/KtA66cC5WEEKUXeT8' WHERE hostel_name = 'Vijaya Aditya Girls Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/TdNs6mZPGi8vTUR58' WHERE hostel_name = 'Tatavarthy Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/RZm37qV5BryLZozu7' WHERE hostel_name = '7 Hills Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/N5CjfWcWfhzyXRrx9' WHERE hostel_name = 'Aditya Tripura Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/KgGHdvy6hDK1pX4E7' WHERE hostel_name = 'OM SAI BOYS HOSTEL' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET google_maps_link = 'https://maps.app.goo.gl/zfcfBTXDmpvNqsWP9' WHERE hostel_name = 'Naresh Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    console.log("✨ Google maps link updates applied successfully.");

    // Perform display flow order updates
    console.log("🛠️ Applying display flow order updates to database...");
    // SRKR Hostels
    await pool.query("UPDATE hostels SET `order` = 3 WHERE hostel_name = 'Sri Vigneswara Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 5 WHERE hostel_name = 'Vijaya Aditya Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 6 WHERE hostel_name = 'Tatavarthy Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 8 WHERE hostel_name = '7 Hills Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 4 WHERE hostel_name = 'P.V.R Girls Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 10 WHERE hostel_name = 'Sri Siva Bala Girls hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 7 WHERE hostel_name = 'OM SAI BOYS HOSTEL' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 1 WHERE hostel_name = 'Naresh Boys Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 2 WHERE hostel_name = 'Naresh Girls Hostel' AND associated_college = 'SRKR Engineering'");
    await pool.query("UPDATE hostels SET `order` = 9 WHERE hostel_name = 'Kusuma Sri Girls Hostel' AND associated_college = 'SRKR Engineering'");

    // Vishnu Hostels
    await pool.query("UPDATE hostels SET `order` = 8 WHERE hostel_name = 'Mitra Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET `order` = 7 WHERE hostel_name = 'Vijaya Aditya Girls Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET `order` = 4 WHERE hostel_name = 'Tatavarthy Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET `order` = 6 WHERE hostel_name = '7 Hills Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET `order` = 2 WHERE hostel_name = 'Aditya Tripura Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET `order` = 1 WHERE hostel_name = 'OM SAI BOYS HOSTEL' AND associated_college = 'Vishnu engineering college'");
    await pool.query("UPDATE hostels SET `order` = 3 WHERE hostel_name = 'Naresh Boys Hostel' AND associated_college = 'Vishnu engineering college'");
    console.log("✨ Display flow order updates applied successfully.");

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

    // Schema migration: google_maps_resolved column for hostels
    const [hostelResolvedMapCols] = await pool.query("SHOW COLUMNS FROM hostels LIKE 'google_maps_resolved'");
    if (hostelResolvedMapCols.length === 0) {
      await pool.query("ALTER TABLE hostels ADD COLUMN google_maps_resolved VARCHAR(500) DEFAULT NULL");
      console.log("✨ Appended 'google_maps_resolved' column to 'hostels' table successfully.");
    }

    // Run Google Maps Resolver asynchronously
    startGoogleMapsResolver(pool);

  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    console.error('👉 Please make sure MySQL is running on', process.env.DB_HOST, 'and database', process.env.DB_NAME, 'exists.');
  }
}

// Background function to resolve short maps URLs to coordinates/places
async function startGoogleMapsResolver(pool) {
  try {
    const [rows] = await pool.query("SELECT id, google_maps_link, hostel_name FROM hostels WHERE google_maps_link IS NOT NULL AND (google_maps_resolved IS NULL OR google_maps_resolved = '')");
    if (rows.length === 0) return;

    console.log(`🔍 Found ${rows.length} hostels with unresolved Google Map links. Resolving in background...`);
    for (const row of rows) {
      const url = row.google_maps_link;
      if (!url.startsWith('http')) continue;

      try {
        const res = await fetch(url, { method: 'GET', redirect: 'manual' });
        const longUrl = res.headers.get('location') || url;

        let resolved = null;

        // 1. Try 3d/4d coordinates first
        const d3Match = longUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (d3Match) {
          resolved = `${d3Match[1]},${d3Match[2]}`;
        } else {
          // 2. Try @ coordinates
          const match = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (match) {
            resolved = `${match[1]},${match[2]}`;
          } else {
            // 3. Try place name
            const placeMatch = longUrl.match(/\/place\/([^\/@?]+)/);
            if (placeMatch) {
              resolved = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
            }
          }
        }

        if (resolved) {
          await pool.query("UPDATE hostels SET google_maps_resolved = ? WHERE id = ?", [resolved, row.id]);
          console.log(`✅ Resolved map link for "${row.hostel_name}" ➔ ${resolved}`);
        } else {
          // Fallback to name or link if cannot parse
          await pool.query("UPDATE hostels SET google_maps_resolved = ? WHERE id = ?", [row.hostel_name + ", Bhimavaram", row.id]);
        }
      } catch (err) {
        console.error(`❌ Failed to resolve map link for ID ${row.id}:`, err.message);
      }
    }
    console.log("✨ Google Maps background resolver completed.");
  } catch (err) {
    console.error("💥 Google Maps background resolver error:", err.message);
  }
}

testConnection();

export default pool;
