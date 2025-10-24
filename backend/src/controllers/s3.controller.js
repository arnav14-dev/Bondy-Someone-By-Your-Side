import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
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

// Direct file upload to S3
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided',
                data: null
            });
        }

        const { type = 'general' } = req.body;
        const file = req.file;
        
        // Generate unique filename
        const fileExtension = file.originalname.split('.').pop();
        const s3FileName = `${type}/${uuidv4()}-${Date.now()}.${fileExtension}`;
        
        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3FileName,
            Body: file.buffer,
            ContentType: file.mimetype
            // Removed ACL as the bucket doesn't support it
        });

        await s3Client.send(command);

        // Generate public URL
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3FileName}`;

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: fileUrl,
                originalName: file.originalname,
                s3FileName: s3FileName,
                size: file.size,
                type: file.mimetype
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

// get pre signed url for upload
export const uploadImageToS3 = async (req, res) => {
    try {
      const { key, contentType, fileName, fileType } = req.body;
      
      // Support both old and new parameter names for backward compatibility
      const actualFileName = key || fileName;
      const actualContentType = contentType || fileType;
  
      if (!actualFileName || !actualContentType) {
        return res.status(400).json({
          success: false,
          message: "fileName (or key) and fileType (or contentType) are required",
          data: null,
        });
      }
  
      const s3FileName = `${uuidv4()}-${actualFileName}`;
  
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3FileName,
        ContentType: actualContentType,
      });
  
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
      return res.status(200).json({
        success: true,
        message: "Pre-signed URL generated successfully",
        data: {
          s3FileName,
          originalFileName: actualFileName,
          uploadUrl: url,
        }
      });
    } catch (error) {
      console.error("Error in uploadImageToS3:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

// get pre signed url to get images from s3
export const getImageFromS3 = async (req, res) => {
    try {
        const { s3FileName } = req.body;
        
        if (!s3FileName) {
            return res.status(400).json({
                success: false,
                message: 'S3 file name is required',
                data: null
            });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3FileName,
        });
        
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'Failed to generate pre-signed URL for image retrieval',
                data: null
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Image URL generated successfully',
            data: {
                imageUrl: url,
                s3FileName: s3FileName
            }
        });
    } catch (error) {
        console.error('Error in getImageFromS3:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// get multiple images from s3
export const getMultipleImagesFromS3 = async (req, res) => {
  try {
    const { s3FileNames } = req.body;

    if (!s3FileNames || !Array.isArray(s3FileNames)) {
      return res.status(400).json({
        success: false,
        message: 'Array of S3 file names is required',
        data: null
      });
    }

    const imageUrls = [];

    for (const s3FileName of s3FileNames) {
      if (s3FileName) {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3FileName,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        imageUrls.push({
          s3FileName: s3FileName,
          imageUrl: url
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Image URLs generated successfully',
      data: imageUrls
    });
  } catch (error) {
    console.error('Error in getMultipleImagesFromS3:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// get pre-signed URL for document viewing
export const getDocumentUrl = async (req, res) => {
  try {
    const { s3FileName } = req.body;

    if (!s3FileName) {
      return res.status(400).json({
        success: false,
        message: 'S3 file name is required',
        data: null
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3FileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry

    return res.status(200).json({
      success: true,
      message: 'Document URL generated successfully',
      data: {
        documentUrl: url,
        s3FileName: s3FileName,
        expiresIn: 3600
      }
    });
  } catch (error) {
    console.error('Error in getDocumentUrl:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};