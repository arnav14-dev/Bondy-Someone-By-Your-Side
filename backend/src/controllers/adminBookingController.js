import Booking from '../models/booking.model.js';
import Companion from '../models/companion.model.js';
import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import WhatsAppService from '../services/whatsappService.js';
import { z } from 'zod';

// Validation schema for booking updates
const bookingUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedCompanion: z.string().optional(),
  adminNotes: z.string().max(500).optional()
});

// Get all bookings with filters and pagination
export const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      serviceType = '',
      city = '',
      dateFrom = '',
      dateTo = '',
      companionId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { taskDescription: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (serviceType) {
      filter.serviceType = serviceType;
    }
    
    if (city) {
      filter.location = { $regex: city, $options: 'i' };
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }
    
    if (companionId) {
      filter.assignedCompanion = companionId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with populated companion data (user data is now stored in userContact)
    const bookings = await Booking.find(filter)
      .populate('assignedCompanion', 'name email mobile specialties location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total,
          hasNext: skip + bookings.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('assignedCompanion', 'name email mobile specialties location bio rating');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = bookingUpdateSchema.parse(req.body);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    // If companion is being assigned, verify companion exists and is available
    if (validatedData.assignedCompanion) {
      const companion = await Companion.findById(validatedData.assignedCompanion);
      if (!companion) {
        return res.status(404).json({
          success: false,
          message: 'Companion not found',
          data: null
        });
      }

      if (!companion.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Companion is not active',
          data: null
        });
      }

      // NO AVAILABILITY CHECKING FOR NOW - ALLOW ALL ASSIGNMENTS
    }

    // Update booking
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        booking[key] = validatedData[key];
      }
    });

    await booking.save();

    // Populate the updated booking
    const updatedBooking = await Booking.findById(id)
      .populate('assignedCompanion', 'name email mobile specialties location');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        booking: updatedBooking
      }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    
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

// Delete booking (soft delete)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    // Soft delete - change status to cancelled
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.adminId;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: null
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Build match filter - if no dates provided, get all bookings
    const matchFilter = {};
    if (dateFrom) {
      matchFilter.createdAt = { ...matchFilter.createdAt, $gte: new Date(dateFrom) };
    }
    if (dateTo) {
      matchFilter.createdAt = { ...matchFilter.createdAt, $lte: new Date(dateTo) };
    }

    // Total bookings
    const totalBookings = await Booking.countDocuments(matchFilter);

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Bookings by service type
    const bookingsByServiceType = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Bookings by city
    const bookingsByCity = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Daily bookings for the last 30 days (or all time if no date filter)
    const dailyBookings = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Revenue calculation (if hourly rate is available)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          ...matchFilter
        }
      },
      {
        $lookup: {
          from: 'companions',
          localField: 'assignedCompanion',
          foreignField: '_id',
          as: 'companion'
        }
      },
      {
        $unwind: '$companion'
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $multiply: ['$duration', '$companion.hourlyRate']
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: {
        totalBookings,
        bookingsByStatus,
        bookingsByServiceType,
        bookingsByCity,
        dailyBookings,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        dateRange: { dateFrom, dateTo }
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get available companions for a specific date and time
export const getAvailableCompanions = async (req, res) => {
  try {
    const { date, time, city, serviceType } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required',
        data: null
      });
    }

    // Build filter for companions - NO FILTERING FOR NOW - SHOW ALL COMPANIONS
    const filter = {};

    // Note: Location filtering is temporarily disabled to allow all companions
    // TODO: Implement proper location matching (city, state, or region-based)
    // if (city) {
    //   filter['location.city'] = { $regex: city, $options: 'i' };
    // }

    // Note: Service type filtering is temporarily disabled to allow all companions
    // TODO: Implement proper service type to specialty mapping
    // if (serviceType) {
    //   filter.specialties = { $elemMatch: { $regex: serviceType, $options: 'i' } };
    // }

    // NO EXISTING BOOKINGS FILTERING FOR NOW - SHOW ALL COMPANIONS

    const companions = await Companion.find(filter)
      .select('name email mobile specialties location bio rating hourlyRate')
      .sort({ rating: -1, hourlyRate: 1 });

    res.status(200).json({
      success: true,
      message: 'Available companions retrieved successfully',
      data: {
        companions,
        totalAvailable: companions.length
      }
    });

  } catch (error) {
    console.error('Get available companions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Assign companion to booking
export const assignCompanionToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { companionId } = req.body;

    if (!companionId) {
      return res.status(400).json({
        success: false,
        message: 'Companion ID is required',
        data: null
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    // Find the companion
    const companion = await Companion.findById(companionId);
    if (!companion) {
      return res.status(404).json({
        success: false,
        message: 'Companion not found',
        data: null
      });
    }

    // Check if companion is active and verified
    if (!companion.isActive || !companion.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Companion is not available for assignment',
        data: null
      });
    }

    // NO AVAILABILITY CHECKING FOR NOW - ALLOW ALL ASSIGNMENTS

    // NO CONFLICTING BOOKING CHECK FOR NOW - ALLOW ALL ASSIGNMENTS

    // Update the booking
    booking.assignedCompanion = companionId;
    booking.status = 'confirmed';
    booking.assignedAt = new Date();
    booking.assignedBy = req.adminId;

    await booking.save();

    // Populate the updated booking
    const updatedBooking = await Booking.findById(bookingId)
      .populate('assignedCompanion', 'name email mobile specialties location bio rating hourlyRate');

    // Send notification message to companion
    try {
      // Create or find conversation with companion
      let conversation = await Conversation.findOne({
        'participants.userId': companionId,
        status: { $in: ['active', 'waiting'] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [{
            userId: companionId,
            role: 'user', // Use 'user' role for companions
            lastSeen: new Date()
          }],
          subject: 'Booking Assignment',
          priority: 'high',
          status: 'active'
        });
        await conversation.save();
      }

      // Create assignment message
      const message = new Message({
        conversationId: conversation._id,
        sender: {
          userId: req.adminId,
          role: 'admin',
          name: 'Admin'
        },
        content: `You have been assigned to a new booking!\n\nBooking Details:\n- Service: ${booking.serviceType.replace('-', ' ').toUpperCase()}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.time}\n- Duration: ${booking.duration} hours\n- Location: ${booking.location}\n- Task: ${booking.taskDescription}\n- User: ${booking.userContact.name} (${booking.userContact.mobile})\n\nPlease contact the user to confirm your availability.`,
        messageType: 'text'
      });

      await message.save();

      // Update conversation
      conversation.lastMessage = {
        content: message.content,
        sender: message.sender.userId,
        timestamp: message.createdAt
      };
      conversation.messageCount += 1;
      conversation.status = 'active';
      await conversation.save();

      // Send WhatsApp message to companion automatically
      try {
        console.log('Sending WhatsApp message to companion:', companion.mobile);
        
        const whatsappResult = await WhatsAppService.sendBookingAssignment(
          companion.mobile,
          booking,
          booking.userContact
        );
        
        if (whatsappResult.success) {
          console.log('WhatsApp message sent successfully:', whatsappResult);
        } else {
          console.error('Failed to send WhatsApp message:', whatsappResult.error);
        }
        
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError);
      }

    } catch (messageError) {
      console.error('Error sending notification to companion:', messageError);
      // Don't fail the assignment if message sending fails
    }

    res.status(200).json({
      success: true,
      message: 'Companion assigned successfully',
      data: {
        booking: updatedBooking
      }
    });

  } catch (error) {
    console.error('Assign companion to booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};
