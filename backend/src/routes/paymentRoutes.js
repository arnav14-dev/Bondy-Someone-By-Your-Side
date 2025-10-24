import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, setCODPayment, getPaymentStatus } from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All payment routes require authentication

router.use(authenticateUser);

// Create Razorpay order
router.post('/create-order/:bookingId', createRazorpayOrder);

// Verify Razorpay payment
router.post('/verify/:bookingId', verifyRazorpayPayment);

// Set COD payment
router.post('/cod/:bookingId', setCODPayment);

// Get payment status
router.get('/status/:bookingId', getPaymentStatus);

export default router;
