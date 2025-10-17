import express from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBooking, 
  updateBooking, 
  cancelBooking, 
  rateBooking, 
  getBookingStats 
} from '../controllers/bookingController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require authentication
router.use(authenticateUser);

// Create a new booking
router.post('/', createBooking);

// Get user's bookings with optional filtering
router.get('/', getUserBookings);

// Get booking statistics
router.get('/stats', getBookingStats);

// Get single booking
router.get('/:bookingId', getBooking);

// Update booking
router.put('/:bookingId', updateBooking);

// Cancel booking
router.patch('/:bookingId/cancel', cancelBooking);

// Rate booking
router.patch('/:bookingId/rate', rateBooking);

export default router;
