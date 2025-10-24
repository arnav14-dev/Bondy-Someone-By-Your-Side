import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    
    const userId = req.user._id;
    
    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    const bookingData = {
      ...req.body,
      userId,
      userContact: {
        name: user.username,
        mobile: user.contactNumber
      }
    };

    // Validate required fields (removed emergencyContact as it's now optional)
    const requiredFields = ['serviceType', 'taskDescription', 'duration', 'date', 'time', 'location'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
          data: null
        });
      }
    }

    // Validate date and time are not in the past and at least 10 minutes ahead
    const bookingDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    console.log('Booking validation:', {
      bookingDateTime: bookingDateTime.toISOString(),
      now: now.toISOString(),
      minBookingTime: minBookingTime.toISOString(),
      isPast: bookingDateTime <= now,
      isLessThanMin: bookingDateTime < minBookingTime
    });
    
    if (bookingDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Booking time must be in the future',
        data: null
      });
    }
    
    if (bookingDateTime < minBookingTime) {
      return res.status(400).json({
        success: false,
        message: 'Booking must be at least 10 minutes ahead of current time',
        data: null
      });
    }

    const booking = await Booking.create(bookingData);

    // Calculate amount based on duration (₹100 per hour)
    const durationMap = {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '6': 6,
      '8': 8,
      'full-day': 8 // Full day is 8 hours
    };

    const hours = durationMap[booking.duration] || 2; // Default to 2 hours
    const amount = hours * 100; // ₹100 per hour

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        ...booking.toObject(),
        calculatedAmount: amount,
        hours: hours
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Create booking error details:', error.message);
    console.error('Create booking error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;


    const query = { userId };
    if (status) {
      query.status = status;
    }


    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedCompanion', 'name mobile specialties location');

    const total = await Booking.countDocuments(query);


    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get single booking
export const getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('assignedCompanion', 'name mobile specialties location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated by user
    delete updateData.userId;
    delete updateData.status;
    delete updateData.assignedCompanion;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this stage',
        data: null
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Rate booking
export const rateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        data: null
      });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings',
        data: null
      });
    }

    booking.rating = rating;
    if (review) {
      booking.review = review;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: booking
    });

  } catch (error) {
    console.error('Rate booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Booking.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgressBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      inProgressBookings: 0,
      cancelledBookings: 0,
      averageRating: 0
    };

    return res.status(200).json({
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};
