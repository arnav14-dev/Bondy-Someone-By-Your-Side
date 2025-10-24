import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import { z } from 'zod';

// Validation schemas
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const adminCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['super_admin', 'admin']).optional()
});

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    // Validate input
    const validatedData = adminLoginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes`,
        data: null
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact super admin',
        data: null
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Create super admin (one-time setup)
export const createSuperAdmin = async (req, res) => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Super admin already exists',
        data: null
      });
    }

    // Validate input
    const validatedData = adminCreateSchema.parse(req.body);
    const { name, email, mobile, password } = validatedData;

    // Create super admin
    const superAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      mobile,
      password,
      role: 'super_admin'
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: {
        admin: superAdmin.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Create super admin error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email or mobile already exists',
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin: admin.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        data: null
      });
    }

    // Update fields
    if (name) admin.name = name;
    if (mobile) admin.mobile = mobile;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: admin.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mobile number already exists',
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
        data: null
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
        data: null
      });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        data: null
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        data: null
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: null
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Admin logout
export const adminLogout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: null
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};







