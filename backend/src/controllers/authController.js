import { signupSchema, loginSchema } from '../zod/zod.Schema.js';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {
    console.log('Received signup request body:', req.body);
    const { username, contactNumber, password, profilePicture, profilePictureOriginalName } = req.body;

    try {
        // Prepare data for validation
        const dataToValidate = { 
            username, 
            contactNumber, 
            password, 
            profilePicture, 
            profilePictureOriginalName 
        };

        console.log('Data to validate:', dataToValidate);
        const validatedData = signupSchema.parse(dataToValidate);
        console.log('Validation successful:', validatedData);

        // Remove null/undefined values for optional fields
        const cleanData = { ...validatedData };
        if (!cleanData.profilePicture || cleanData.profilePicture === null) {
            delete cleanData.profilePicture;
        }

        const user = await User.create(cleanData);

        // Convert to object and remove sensitive data
        const userObj = user.toObject();
        delete userObj.password;

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userObj
        });

    } catch (error) {
        console.error('Signup error:', error);
        
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
            console.log('Zod validation errors:', error.errors);
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
    console.log('Received login request body:', req.body);
    const { contactNumber, password } = req.body;

    try {
        // Validate input data
        const validatedData = loginSchema.parse({ contactNumber, password });

        // Find user by contact number
        console.log('Looking for user with contact number:', validatedData.contactNumber);
        const user = await User.findOne({ contactNumber: validatedData.contactNumber });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('No user found with contact number:', validatedData.contactNumber);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                data: null
            });
        }

        // Check password using bcrypt
        console.log('Checking password for user:', user.username);
        console.log('Provided password length:', validatedData.password.length);
        console.log('Stored password hash length:', user.password.length);
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        console.log('Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Password validation failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                data: null
            });
        }

        // Convert to object and remove sensitive data
        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: userObj
        });

    } catch (error) {
        console.error('Login error:', error);
        
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