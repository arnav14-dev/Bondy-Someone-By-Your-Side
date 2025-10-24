import { signupSchema, loginSchema } from '../zod/zod.Schema.js';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    const { username, contactNumber, password } = req.body;

    try {
        // Prepare data for validation
        const dataToValidate = { 
            username, 
            contactNumber, 
            password
        };

        const validatedData = signupSchema.parse(dataToValidate);

        const user = await User.create(validatedData);

        // Convert to object and remove sensitive data
        const userObj = user.toObject();
        delete userObj.password;

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                contactNumber: user.contactNumber 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: userObj,
                token: token
            }
        });

    } catch (error) {
        
        if (error.code === 11000) {
            // Check which field caused the duplicate key error
            const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown field';
            if (duplicateField === 'contactNumber') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User with this contact number already exists',
                    data: { field: duplicateField }
                });
            }
            return res.status(400).json({ 
                success: false, 
                message: `User with this ${duplicateField} already exists`,
                data: { field: duplicateField }
            });
        }
        
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error',
                data: error.errors
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            data: null 
        });
    }
}

export const login = async (req, res) => {
    const { contactNumber, password } = req.body;

    try {
        // Validate input data
        const validatedData = loginSchema.parse({ contactNumber, password });

        // Find user by contact number
        const user = await User.findOne({ contactNumber: validatedData.contactNumber });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                data: null
            });
        }

        // Check password using bcrypt
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                data: null
            });
        }

        // Convert to object and remove sensitive data
        const userObj = user.toObject();
        delete userObj.password;

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                contactNumber: user.contactNumber 
            },
            process.env.JWT_SECRET || 'your-secret-key', // Use environment variable or fallback
            { expiresIn: '7d' } // Token expires in 7 days
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userObj,
                token: token
            }
        });

    } catch (error) {
        
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error',
                data: error.errors
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
}

export const logout = (req, res) => {
    // TODO: Implement logout
    res.status(200).json({ 
        success: true, 
        message: 'Logout endpoint - implementation pending',
        data: null 
    });
}

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
                data: null
            });
        }

        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
}


export const getCurrentUser = async (req, res) => {
    try {
        // User is already attached to req by authenticateUser middleware
        const user = req.user;
        
        return res.status(200).json({
            success: true,
            message: 'Current user retrieved successfully',
            data: user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
}