import fs from 'fs';
import path from 'path';

function populateMockImages() {
  console.log('⏳ Generating actual mock image assets on disk for testing...');

  const hostelsDir = path.resolve('..', 'Uploads', 'Hostels');
  const roomsDir = path.resolve('..', 'Uploads', 'Rooms');

  // Helper to copy a file safely
  const copyFileSafe = (src, dest) => {
    try {
      fs.copyFileSync(src, dest);
    } catch (err) {
      console.error(`❌ Failed to copy ${src} to ${dest}:`, err.message);
    }
  };

  // 1. Populate Hostels Mock Images (1 to 15)
  const hostelSourcePrimary = path.join(hostelsDir, 'H2.1.jpg');
  const hostelSourceSecondary = path.join(hostelsDir, 'H2.2.jpg');

  if (fs.existsSync(hostelSourcePrimary)) {
    for (let i = 1; i <= 15; i++) {
      const destPrimary = path.join(hostelsDir, `mock-${i}-primary.jpg`);
      const destSecondary = path.join(hostelsDir, `mock-${i}-secondary.jpg`);
      copyFileSafe(hostelSourcePrimary, destPrimary);
      copyFileSafe(hostelSourceSecondary, destSecondary);
    }
    console.log('✅ Generated 30 hostel mock image files on disk (mock-1 to mock-15).');
  } else {
    console.warn('⚠️ Source H2.1.jpg not found. Copying H1.1.jpg instead...');
    const fallbackPrimary = path.join(hostelsDir, 'H1.1.jpg');
    if (fs.existsSync(fallbackPrimary)) {
      for (let i = 1; i <= 15; i++) {
        copyFileSafe(fallbackPrimary, path.join(hostelsDir, `mock-${i}-primary.jpg`));
        copyFileSafe(fallbackPrimary, path.join(hostelsDir, `mock-${i}-secondary.jpg`));
      }
    }
  }

  // 2. Populate Rooms Mock Images (1 to 25)
  const roomSourcePrimary = path.join(roomsDir, 'R1.1.jpg');
  const roomSourceSecondary = path.join(roomsDir, 'R1.2.jpg');

  if (fs.existsSync(roomSourcePrimary)) {
    for (let i = 1; i <= 25; i++) {
      const destPrimary = path.join(roomsDir, `mock-${i}-primary.jpg`);
      const destSecondary = path.join(roomsDir, `mock-${i}-secondary.jpg`);
      copyFileSafe(roomSourcePrimary, destPrimary);
      copyFileSafe(roomSourceSecondary, destSecondary);
    }
    console.log('✅ Generated 50 room mock image files on disk (mock-1 to mock-25).');
  } else {
    console.warn('⚠️ Source R1.1.jpg not found.');
  }

  console.log('🎉 Mock image generation completed successfully!');
}

populateMockImages();
