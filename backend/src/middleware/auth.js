import User from '../models/user.model.js';

// Middleware to verify if user is authenticated
export const authenticateUser = async (req, res, next) => {
  try {
    // Get user ID from request (could be from token, session, or header)
    const userId = req.headers['x-user-id'] || req.headers['user-id'] || req.body.userId || req.query.userId;
    
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User ID required.',
        data: null
      });
    }

    // Find user in database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
        data: null
      });
    }

    // Add user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
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
