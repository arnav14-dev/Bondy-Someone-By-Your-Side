import express from 'express';
import { uploadImageToS3, getImageFromS3, getMultipleImagesFromS3 } from '../controllers/s3.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Note: S3 routes are public for signup process
// In production, you might want to add rate limiting or other security measures
router.post('/get-pre-signed-url', uploadImageToS3);
router.post('/get-image-from-s3', authenticateUser, getImageFromS3);
router.post('/get-multiple-images-from-s3', authenticateUser, getMultipleImagesFromS3);

export default router;