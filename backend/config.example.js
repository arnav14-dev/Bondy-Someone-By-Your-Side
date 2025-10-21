// Example configuration file - Copy to .env for production
module.exports = {
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gen-link',
  DB_NAME: process.env.DB_NAME || 'gen-link',

  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'your_aws_access_key_here',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'your_aws_secret_key_here',
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-2',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'testing-s3-arnav',

  // JWT Configuration (if using JWT in the future)
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
};
