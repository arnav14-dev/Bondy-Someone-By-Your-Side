import Booking from '../models/booking.model.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    
    const userId = req.user._id;
    const bookingData = {
      ...req.body,
      userId
    };


    // Validate required fields
    const requiredFields = ['serviceType', 'taskDescription', 'duration', 'date', 'time', 'location', 'emergencyContact'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
          data: null
        });
      }
    }

    // Validate date is not in the past
    const bookingDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past',
        data: null
      });
    }

    const booking = await Booking.create(bookingData);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
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
      .populate('assignedCompanion', 'username contactNumber profilePicture');

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
      .populate('assignedCompanion', 'username contactNumber profilePicture governmentIdType');

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
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      pendingBookings: 0,
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
