import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/utils/db.js';
import authRoutes from './src/routes/authRoutes.js';
import s3Routes from './src/routes/s3Routes.js';
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Gen-Link Backend API is running!' });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/s3', s3Routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
  

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


// Start server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');
    console.log(`Starting server on port ${PORT}...`);
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();