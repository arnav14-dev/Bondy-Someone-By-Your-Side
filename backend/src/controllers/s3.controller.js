import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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