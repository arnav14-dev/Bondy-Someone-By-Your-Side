import express from 'express';
import { uploadFile, uploadMiddleware, getOptimizedImageUrl, deleteFile, getFileInfo } from '../controllers/cloudinary.controller.js';

const router = express.Router();

// Upload file endpoint
router.post('/upload', uploadMiddleware, uploadFile);

// Get optimized image URL
router.post('/get-optimized-url', getOptimizedImageUrl);

// Delete file
router.post('/delete', deleteFile);

// Get file info
router.post('/get-info', getFileInfo);

export default router;
