import Companion from '../models/companion.model.js';
import { z } from 'zod';

// Validation schemas
const companionCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(10, 'Mobile number must be at most 10 digits'),
  age: z.number().min(18, 'Age must be at least 18').max(100, 'Age must be at most 100'),
  gender: z.enum(['male', 'female'], { message: 'Gender must be male or female' }),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  governmentProof: z.string().min(1, 'Government proof is required'),
  governmentProofOriginalName: z.string().min(1, 'Government proof original name is required'),
  governmentProofPublicId: z.string().min(1, 'Government proof public ID is required'),
  profilePicture: z.string().optional(),
  profilePictureOriginalName: z.string().optional(),
  profilePicturePublicId: z.string().optional(),
  bio: z.string().min(5, 'Bio must be at least 5 characters').max(500, 'Bio must not exceed 500 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  experience: z.number().min(0, 'Experience cannot be negative'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative'),
  location: z.object({
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(6, 'Pincode must be at least 6 digits'),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  }),
  languages: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    mobile: z.string().min(10, 'Emergency contact mobile is required'),
    relation: z.string().min(2, 'Emergency contact relation is required')
  }).optional().or(z.undefined())
});

const companionUpdateSchema = companionCreateSchema.partial();

// Create companion
export const createCompanion = async (req, res) => {
  try {
    // Validate input
    const validatedData = companionCreateSchema.parse(req.body);

    // Check if companion with same email or mobile already exists
    const existingCompanion = await Companion.findOne({ 
      $or: [
        { email: validatedData.email.toLowerCase() },
        { mobile: validatedData.mobile }
      ]
    });
    if (existingCompanion) {
      let message = 'Companion with this email already exists';
      if (existingCompanion.email === validatedData.email.toLowerCase()) {
        message = 'Email address is already in use';
      } else if (existingCompanion.mobile === validatedData.mobile) {
        message = 'Contact number is already in use';
      }
      
      return res.status(409).json({
        success: false,
        message: message,
        data: null
      });
    }

    // Create companion
    const companion = new Companion({
      ...validatedData,
      email: validatedData.email.toLowerCase()
    });

    await companion.save();

    res.status(201).json({
      success: true,
      message: 'Companion created successfully',
      data: {
        companion: companion.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Create companion error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: error.errors
      });
    }

    if (error.code === 11000) {
      // Check which field caused the duplicate key error
      let message = 'Companion with this email already exists';
      
      if (error.keyPattern && error.keyPattern.mobile) {
        message = 'Contact number is already in use';
      } else if (error.keyPattern && error.keyPattern.email) {
        message = 'Email address is already in use';
      }
      
      return res.status(409).json({
        success: false,
        message: message,
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

// Get all companions
export const getAllCompanions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      city = '',
      specialty = '',
      isActive = '',
      isVerified = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    
    if (specialty) {
      filter.specialties = { $in: [new RegExp(specialty, 'i')] };
    }
    
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    
    if (isVerified !== '') {
      filter.isVerified = isVerified === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get companions with pagination
    const companions = await Companion.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-bankDetails -verificationDocuments');

    // Get total count
    const total = await Companion.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Companions retrieved successfully',
      data: {
        companions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCompanions: total,
          hasNext: skip + companions.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all companions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get companion by ID
export const getCompanionById = async (req, res) => {
  try {
    const { id } = req.params;

    const companion = await Companion.findById(id);
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: 'Companion not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Companion retrieved successfully',
      data: {
        companion: companion.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get companion by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Update companion
export const updateCompanion = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = companionUpdateSchema.parse(req.body);

    const companion = await Companion.findById(id);
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: 'Companion not found',
        data: null
      });
    }

    // Update fields
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        companion[key] = validatedData[key];
      }
    });

    // If email is being updated, check for duplicates
    if (validatedData.email && validatedData.email !== companion.email) {
      const existingCompanion = await Companion.findOne({
        $or: [
          { email: validatedData.email.toLowerCase() },
          { mobile: validatedData.mobile }
        ],
        _id: { $ne: id }
      });
      if (existingCompanion) {
        let message = 'Companion with this email already exists';
        if (existingCompanion.email === validatedData.email.toLowerCase()) {
          message = 'Email address is already in use';
        } else if (existingCompanion.mobile === validatedData.mobile) {
          message = 'Contact number is already in use';
        }
        
        return res.status(409).json({
          success: false,
          message: message,
          data: null
        });
      }
      companion.email = validatedData.email.toLowerCase();
    }

    await companion.save();

    res.status(200).json({
      success: true,
      message: 'Companion updated successfully',
      data: {
        companion: companion.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Update companion error:', error);
    
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

// Delete companion
export const deleteCompanion = async (req, res) => {
  try {
    const { id } = req.params;

    const companion = await Companion.findById(id);
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: 'Companion not found',
        data: null
      });
    }

    // Soft delete - just deactivate
    companion.isActive = false;
    await companion.save();

    res.status(200).json({
      success: true,
      message: 'Companion deactivated successfully',
      data: null
    });

  } catch (error) {
    console.error('Delete companion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Toggle companion status
export const toggleCompanionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const companion = await Companion.findById(id);
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: 'Companion not found',
        data: null
      });
    }

    companion.isActive = isActive;
    await companion.save();

    res.status(200).json({
      success: true,
      message: `Companion ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        companion: companion.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Toggle companion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Verify companion
export const verifyCompanion = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const companion = await Companion.findById(id);
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: 'Companion not found',
        data: null
      });
    }

    companion.isVerified = isVerified;
    await companion.save();

    res.status(200).json({
      success: true,
      message: `Companion ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: {
        companion: companion.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Verify companion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get companion statistics
export const getCompanionStats = async (req, res) => {
  try {
    const totalCompanions = await Companion.countDocuments();
    const activeCompanions = await Companion.countDocuments({ isActive: true });
    const verifiedCompanions = await Companion.countDocuments({ isVerified: true });
    const pendingVerification = await Companion.countDocuments({ 
      isActive: true, 
      isVerified: false 
    });

    // Get companions by city
    const companionsByCity = await Companion.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get companions by specialty
    const companionsBySpecialty = await Companion.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$specialties' },
      { $group: { _id: '$specialties', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Companion statistics retrieved successfully',
      data: {
        totalCompanions,
        activeCompanions,
        verifiedCompanions,
        pendingVerification,
        companionsByCity,
        companionsBySpecialty
      }
    });

  } catch (error) {
    console.error('Get companion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};





