import { Router } from 'express';
import multer from 'multer';
import adminController from '../../controllers/admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadRateLimiter } from '../../middleware/rateLimit.middleware';
import { sendError } from '../../utils/response.util';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// All admin routes require authentication
router.use(authenticate);
router.use(uploadRateLimiter);

router.post(
  '/',
  upload.single('file'),
  (req, res, next): void => {
    if (!req.file) {
      sendError(res, 'NO_FILE', 'No file uploaded', 400);
      return;
    }
    return next();
  },
  adminController.uploadImage
);


// Error handling for multer
router.use((error: any, _req: any, res: any, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'FILE_TOO_LARGE', 'File size exceeds 5MB limit', 413);
      return;
    }
    sendError(res, 'UPLOAD_ERROR', error.message, 400);
      return;
  }

  if (error.message && error.message.includes('Invalid file type')) {
    sendError(
      res,
      'INVALID_FILE_TYPE',
      'Only image files are allowed (jpg, jpeg, png, gif, webp)',
      400
    );
    return;
  }

  return next(error);
});


export default router;
