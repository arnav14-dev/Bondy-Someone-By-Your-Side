import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/utils/db.js';
import authRoutes from './src/routes/authRoutes.js';
import s3Routes from './src/routes/s3Routes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import userLocationRoutes from './src/routes/userLocationRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CHAT_PORT = process.env.CHAT_PORT || 3005;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Create HTTP server for Socket.IO
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: isProduction 
      ? process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com']
      : true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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

// More lenient rate limiting for S3 routes (images)
const s3Limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Allow more requests for image loading
  message: {
    success: false,
    message: 'Too many image requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/s3', s3Limiter);

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle incoming messages
  socket.on('message', (data) => {
    console.log('Message received:', data);
    
    // Echo the message back to the client (for now)
    // In a real app, you'd save to database and broadcast to other users
    socket.emit('message', {
      message: `Support: Thank you for your message: "${data.message}". Our team will respond shortly.`,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start servers
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // Start main API server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API Server is running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      if (!isProduction) {
        console.log(`Network: http://192.168.0.100:${PORT}`);
        console.log(`Access from other devices: http://192.168.0.100:${PORT}`);
      }
    });
    
    // Start Socket.IO server
    httpServer.listen(CHAT_PORT, '0.0.0.0', () => {
      console.log(`Chat Server is running on port ${CHAT_PORT}`);
      console.log(`Socket.IO: http://localhost:${CHAT_PORT}`);
      if (!isProduction) {
        console.log(`Network Chat: http://192.168.0.100:${CHAT_PORT}`);
      }
    });
    
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();