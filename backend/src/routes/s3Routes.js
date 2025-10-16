import express from 'express';
import { uploadImageToS3, getImageFromS3, getMultipleImagesFromS3 } from '../controllers/s3.controller.js';

const router = express.Router();

router.post('/get-pre-signed-url', uploadImageToS3);
router.post('/get-image-from-s3', getImageFromS3);
router.post('/get-multiple-images-from-s3', getMultipleImagesFromS3);

export default router;