import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Target directory is NIVAS-2.O/Uploads
const UPLOADS_ROOT = path.resolve('..', 'Uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'Hostels';
    if (req.baseUrl.includes('banners')) {
      subfolder = 'Banners';
    } else if (req.baseUrl.includes('rooms')) {
      subfolder = 'Rooms';
    }
    
    const dest = path.join(UPLOADS_ROOT, subfolder);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports images (jpeg, jpg, png, webp)!'));
  }
});

export default upload;
