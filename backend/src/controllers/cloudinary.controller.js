import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Middleware for file upload
export const uploadMiddleware = upload.single('file');

// Upload file to Cloudinary
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
        data: null
      });
    }

    const { type = 'companions' } = req.body;
    const file = req.file;

    // Convert buffer to base64 for Cloudinary
    const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `companions/${type}`, // Organize by type (profile, document, etc.)
      resource_type: 'auto', // Auto-detect resource type
      quality: 'auto', // Auto-optimize quality
      fetch_format: 'auto', // Auto-optimize format
    });

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Error in uploadFile:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = async (req, res) => {
  try {
    const { publicId, transformations = {} } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
        data: null
      });
    }

    // Default transformations for companion images
    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto',
      width: transformations.width || 400,
      height: transformations.height || 400,
      crop: transformations.crop || 'fill',
      gravity: transformations.gravity || 'face',
      ...transformations
    };

    const url = cloudinary.url(publicId, defaultTransformations);

    return res.status(200).json({
      success: true,
      message: 'Optimized URL generated successfully',
      data: {
        url: url,
        publicId: publicId,
        transformations: defaultTransformations
      }
    });

  } catch (error) {
    console.error('Error in getOptimizedImageUrl:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate optimized URL',
      error: error.message
    });
  }
};

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
        data: null
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        result: result
      }
    });

  } catch (error) {
    console.error('Error in deleteFile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

// Get file info from Cloudinary
export const getFileInfo = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
        data: null
      });
    }

    const result = await cloudinary.api.resource(publicId);

    return res.status(200).json({
      success: true,
      message: 'File info retrieved successfully',
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        createdAt: result.created_at
      }
    });

  } catch (error) {
    console.error('Error in getFileInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error.message
    });
  }
};
