import Razorpay from 'razorpay';
import Booking from '../models/booking.model.js';
import crypto from 'crypto';

// Initialize Razorpay with test credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Replace with your actual key
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_secret_key_here' // Replace with your actual secret
});

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

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
    const amount = hours * 100 * 100; // Convert to paise (₹100 = 10000 paise)

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        hours: hours
      }
    };

    const order = await razorpay.orders.create(options);

    // Update booking with payment details
    booking.payment = {
      ...booking.payment,
      method: 'online',
      amount: amount / 100, // Store in rupees
      razorpayOrderId: order.id,
      status: 'pending'
    };
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'
      }
    });

  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      data: null
    });
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_secret_key_here')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful
      booking.payment = {
        ...booking.payment,
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
      };
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: razorpay_payment_id,
          amount: booking.payment.amount,
          status: 'paid'
        }
      });
    } else {
      // Payment verification failed
      booking.payment = {
        ...booking.payment,
        status: 'failed'
      };
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: null
      });
    }

  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      data: null
    });
  }
};

// Set COD payment
export const setCODPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

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

    // Update booking with COD payment details
    booking.payment = {
      ...booking.payment,
      method: 'cod',
      amount: amount,
      status: 'pending' // COD is pending until service is completed
    };
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'COD payment set successfully',
      data: {
        method: 'cod',
        amount: amount,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Set COD payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set COD payment',
      data: null
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: {
        method: booking.payment?.method || null,
        status: booking.payment?.status || 'pending',
        amount: booking.payment?.amount || 0,
        paidAt: booking.payment?.paidAt || null
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      data: null
    });
  }
};
