import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary with A+ Grade credentials
// Fallback to user credentials if environment variables are not yet defined on local launch
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'duibjer7p',
  api_key: process.env.CLOUDINARY_API_KEY || '946764485934438',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'C0Ed1vYS9aHCQJXgPqkmaPWh1Fk'
});

/**
 * Uploads a local file to Cloudinary and deletes it from local disk immediately after.
 * @param {string} localFilePath - Path to the local file uploaded by multer.
 * @param {string} folder - Target Cloudinary folder (default: 'nivas').
 * @returns {Promise<string>} The secure CDN URL of the uploaded image.
 */
export const uploadToCloudinary = async (localFilePath, folder = 'nivas') => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary CDN
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'image'
    });

    // Clean up local file from disk immediately to prevent bloating the server disk
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    // Ensure clean-up of local file even if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('⚠️ Failed to clean up file after failed upload:', err);
      }
    }
    console.error('❌ Cloudinary Upload Error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export default cloudinary;
