import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import connectDB from './src/utils/db.js';
import authRoutes from './src/routes/authRoutes.js';
import s3Routes from './src/routes/s3Routes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import userLocationRoutes from './src/routes/userLocationRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com']
    : true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'user-id'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Gen-Link Backend API is running!' });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/s3', s3Routes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user-locations', userLocationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
  

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`${timestamp} - Error:`, err.stack);
  
  // Don't leak error details in production
  const message = isProduction 
    ? 'Something went wrong!' 
    : err.message || 'Something went wrong!';
  
  res.status(err.status || 500).json({ 
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');
    console.log(`Starting server on port ${PORT}...`);
    console.log(`Environment: ${NODE_ENV}`);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      if (!isProduction) {
        console.log(`Network: http://192.168.0.100:${PORT}`);
        console.log(`Access from other devices: http://192.168.0.100:${PORT}`);
      }
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();