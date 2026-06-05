import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function populateImagesFromDummy() {
  console.log('⏳ Starting image population from dummy_img to Uploads...');
  
  const rootDir = path.resolve(__dirname, '..');
  const dummyImgDir = path.join(rootDir, 'dummy_img');
  const hostelsUploadDir = path.join(rootDir, 'Uploads', 'Hostels');
  const roomsUploadDir = path.join(rootDir, 'Uploads', 'Rooms');

  try {
    // 1. Fetch all files from dummy_img
    if (!fs.existsSync(dummyImgDir)) {
      throw new Error(`dummy_img directory not found at: ${dummyImgDir}`);
    }

    const allFiles = fs.readdirSync(dummyImgDir);
    console.log(`📂 Found ${allFiles.length} files in dummy_img directory.`);

    // 2. Separate into apartment (primary) and normal images
    // Filtering out non-image files (.url, .gif, etc.)
    const isImageFile = (filename) => {
      const ext = path.extname(filename).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    };

    const apartmentImages = allFiles.filter(f => f.toLowerCase().includes('apartment') && isImageFile(f));
    const normalImages = allFiles.filter(f => !f.toLowerCase().includes('apartment') && isImageFile(f));

    console.log(`✨ Filtered: ${apartmentImages.length} apartment (primary) images and ${normalImages.length} normal images.`);

    if (apartmentImages.length === 0) {
      throw new Error('No apartment images found in dummy_img folder.');
    }
    if (normalImages.length === 0) {
      throw new Error('No normal images found in dummy_img folder.');
    }

    // 3. Clear existing photos from DB
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE hostel_photos');
    await pool.query('TRUNCATE TABLE room_photos');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️ Cleared existing photo records from database.');

    // Clear existing mock files on disk to prevent clutter
    const clearDir = (dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          fs.unlinkSync(path.join(dir, file));
        }
      } else {
        fs.mkdirSync(dir, { recursive: true });
      }
    };
    clearDir(hostelsUploadDir);
    clearDir(roomsUploadDir);
    console.log('🗑️ Cleared existing image files inside Uploads/Hostels and Uploads/Rooms.');

    // 4. Fetch Hostels and Rooms from DB to map them correctly
    const [hostels] = await pool.query('SELECT id FROM hostels ORDER BY id ASC');
    const [rooms] = await pool.query('SELECT id FROM rooms ORDER BY id ASC');

    console.log(`🔗 Mapping images for ${hostels.length} hostels and ${rooms.length} rooms...`);

    // Helper to copy a file safely
    const copyFile = (src, dest) => {
      fs.copyFileSync(src, dest);
    };

    let apartmentIdx = 0;
    let normalIdx = 0;

    // 5. Populate Hostels
    for (const hostel of hostels) {
      const hostelId = hostel.id;

      // Select 1 primary apartment image (modulo ensures wrap-around if files are fewer than required)
      const primaryImgFile = apartmentImages[apartmentIdx++ % apartmentImages.length];
      const primaryExt = path.extname(primaryImgFile);
      const primaryDestFilename = `hostel_${hostelId}_primary${primaryExt}`;
      const primaryDestPath = path.join(hostelsUploadDir, primaryDestFilename);
      copyFile(path.join(dummyImgDir, primaryImgFile), primaryDestPath);

      // Insert primary photo record in database
      await pool.query(
        'INSERT INTO hostel_photos (hostel_id, photo, is_primary) VALUES (?, ?, 1)',
        [hostelId, `Uploads/Hostels/${primaryDestFilename}`]
      );

      // Select 3 normal images
      for (let j = 1; j <= 3; j++) {
        const normalImgFile = normalImages[normalIdx++ % normalImages.length];
        const normalExt = path.extname(normalImgFile);
        const normalDestFilename = `hostel_${hostelId}_normal_${j}${normalExt}`;
        const normalDestPath = path.join(hostelsUploadDir, normalDestFilename);
        copyFile(path.join(dummyImgDir, normalImgFile), normalDestPath);

        // Insert normal photo record in database
        await pool.query(
          'INSERT INTO hostel_photos (hostel_id, photo, is_primary) VALUES (?, ?, 0)',
          [hostelId, `Uploads/Hostels/${normalDestFilename}`]
        );
      }
    }
    console.log(`✅ Fully populated images for ${hostels.length} Hostels.`);

    // 6. Populate Rooms
    for (const room of rooms) {
      const roomId = room.id;

      // Select 1 primary apartment image
      const primaryImgFile = apartmentImages[apartmentIdx++ % apartmentImages.length];
      const primaryExt = path.extname(primaryImgFile);
      const primaryDestFilename = `room_${roomId}_primary${primaryExt}`;
      const primaryDestPath = path.join(roomsUploadDir, primaryDestFilename);
      copyFile(path.join(dummyImgDir, primaryImgFile), primaryDestPath);

      // Insert primary photo record in database
      await pool.query(
        'INSERT INTO room_photos (room_id, photo, is_primary) VALUES (?, ?, 1)',
        [roomId, `Uploads/Rooms/${primaryDestFilename}`]
      );

      // Select 3 normal images
      for (let j = 1; j <= 3; j++) {
        const normalImgFile = normalImages[normalIdx++ % normalImages.length];
        const normalExt = path.extname(normalImgFile);
        const normalDestFilename = `room_${roomId}_normal_${j}${normalExt}`;
        const normalDestPath = path.join(roomsUploadDir, normalDestFilename);
        copyFile(path.join(dummyImgDir, normalImgFile), normalDestPath);

        // Insert normal photo record in database
        await pool.query(
          'INSERT INTO room_photos (room_id, photo, is_primary) VALUES (?, ?, 0)',
          [roomId, `Uploads/Rooms/${normalDestFilename}`]
        );
      }
    }
    console.log(`✅ Fully populated images for ${rooms.length} Rooms.`);

    console.log('🎉 Image population completed successfully! 1 Primary + 3 Normal images assigned to every hostel and room.');
  } catch (error) {
    console.error('❌ Image population failed with error:', error);
  } finally {
    process.exit(0);
  }
}

populateImagesFromDummy();
