import { signupSchema } from '../zod/zod.Schema.js';
import User from '../models/user.model.js';

export const signup = async (req, res) => {
    console.log('Received signup request body:', req.body);
    const { username, contactNumber, password, governmentId, governmentIdType, idVerificationMethod, idImage, idImageOriginalName, profilePicture, profilePictureOriginalName } = req.body;

    try {
        // Prepare data for validation based on verification method
        let dataToValidate = { username, contactNumber, password, governmentIdType, idVerificationMethod };
        
        if (idVerificationMethod === 'number') {
            dataToValidate.governmentId = governmentId;
            dataToValidate.idImage = null;
        } else {
            dataToValidate.governmentId = null;
            dataToValidate.idImage = idImage;
        }
        
        dataToValidate.profilePicture = profilePicture;
        dataToValidate.profilePictureOriginalName = profilePictureOriginalName;
        dataToValidate.idImageOriginalName = idImageOriginalName;

        console.log('Data to validate:', dataToValidate);
        const validatedData = signupSchema.parse(dataToValidate);
        console.log('Validation successful:', validatedData);

        // Remove null/undefined values to avoid sparse index issues
        const cleanData = { ...validatedData };
        
        // For image verification method, completely remove governmentId
        if (cleanData.idVerificationMethod === 'image') {
            delete cleanData.governmentId;
        }
        // For number verification method, completely remove idImage
        if (cleanData.idVerificationMethod === 'number') {
            delete cleanData.idImage;
        }
        
        // Remove null/undefined values for optional fields
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

export const login = (req, res) => {
    // TODO: Implement login
    res.status(200).json({ 
        success: true, 
        message: 'Login endpoint - implementation pending',
        data: null 
    });
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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
}