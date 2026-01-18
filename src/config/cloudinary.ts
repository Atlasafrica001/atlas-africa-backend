import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn('⚠️  WARNING: Cloudinary credentials not fully configured!');
  console.warn('⚠️  Image uploads will not work. Please set:');
  console.warn('    - CLOUDINARY_CLOUD_NAME');
  console.warn('    - CLOUDINARY_API_KEY');
  console.warn('    - CLOUDINARY_API_SECRET');
}

export { cloudinary };
