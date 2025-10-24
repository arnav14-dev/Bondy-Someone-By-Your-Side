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
import cloudinaryRoutes from './src/routes/cloudinaryRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import userLocationRoutes from './src/routes/userLocationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';

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
      : 'http://localhost:5173',
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

// CORS configuration - must be before rate limiting
const corsOptions = {
  origin: isProduction 
    ? process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com']
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://192.168.31.196:5173', // Current WiFi network
        'http://192.168.0.100:5173',  // Previous WiFi network
        'http://192.168.1.100:5173'   // Common home network
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-User-Id', // Standard convention for custom headers
    'UserId',
    'user-id', // The exact header seen in your error log
    'x-user-id',
    'userId'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting - very lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // Very high limit for development
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
  max: 20000, // Very high limit for image loading
  message: {
    success: false,
    message: 'Too many image requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very lenient rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // Very high limit for admin operations
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting after CORS
app.use('/api/admin', adminLimiter);
app.use('/api/', limiter);
app.use('/api/s3', s3Limiter);


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Bondy-Someone-By-Your-Side Backend API is running!' });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/s3', s3Routes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user-locations', userLocationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);

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
  console.log('User connected:', socket.id);

  // Join user to their room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join admin to admin room
  socket.on('join-admin', (adminId) => {
    socket.join(`admin-${adminId}`);
    socket.join('admin-room');
    console.log(`Admin ${adminId} joined admin room`);
  });

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`User joined conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('new-message', (data) => {
    const { conversationId, message, senderType } = data;
    
    // Broadcast to conversation room
    socket.to(`conversation-${conversationId}`).emit('message-received', {
      conversationId,
      message,
      senderType
    });

    // If user sent message, notify admins
    if (senderType === 'user') {
      socket.to('admin-room').emit('new-user-message', {
        conversationId,
        message
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { conversationId, isTyping, senderType } = data;
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      conversationId,
      isTyping,
      senderType
    });
  });

  // Handle conversation status update
  socket.on('conversation-updated', (data) => {
    const { conversationId, status, assignedAdmin } = data;
    socket.to(`conversation-${conversationId}`).emit('conversation-status-changed', {
      conversationId,
      status,
      assignedAdmin
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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