import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// JWT-based authentication middleware for users
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        data: null
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('JWT decoded:', decoded);
    console.log('Looking for user with ID:', decoded.userId);
    
    // Find user in database
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', !!user);
    if (user) {
      console.log('User details:', { id: user._id, username: user.username, contactNumber: user.contactNumber });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
        data: null
      });
    }

    // Add user info to request object for use in route handlers
    req.user = user;
    req.userId = user._id; // Add this for chat controller compatibility
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        data: null
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        data: null
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      data: null
    });
  }
};

// Middleware to check if user is admin (for future role-based access)
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      data: null
    });
  }
  next();
};

// Middleware to verify user owns the resource (for user-specific operations)
export const verifyOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  const currentUserId = req.user._id.toString();
  
  if (resourceUserId !== currentUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
      data: null
    });
  }
  next();
};
