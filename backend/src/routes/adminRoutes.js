import express from 'express';
import {
  adminLogin,
  createSuperAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  adminLogout
} from '../controllers/adminController.js';
import {
  createCompanion,
  getAllCompanions,
  getCompanionById,
  updateCompanion,
  deleteCompanion,
  toggleCompanionStatus,
  verifyCompanion,
  getCompanionStats
} from '../controllers/companionController.js';
import {
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
  getAvailableCompanions,
  assignCompanionToBooking
} from '../controllers/adminBookingController.js';
import { authenticateAdmin, requireSuperAdmin, requireAdminOrSuper } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', adminLogin);
router.post('/create-super-admin', createSuperAdmin); // One-time setup

// Protected routes (authentication required)
router.use(authenticateAdmin); // All routes below require admin authentication

// Admin profile routes
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changePassword);
router.post('/logout', adminLogout);

// Companion management routes
router.post('/companions', requireAdminOrSuper, createCompanion);
router.get('/companions', requireAdminOrSuper, getAllCompanions);
router.get('/companions/stats', requireAdminOrSuper, getCompanionStats);
router.get('/companions/:id', requireAdminOrSuper, getCompanionById);
router.put('/companions/:id', requireAdminOrSuper, updateCompanion);
router.delete('/companions/:id', requireSuperAdmin, deleteCompanion);
router.patch('/companions/:id/toggle-status', requireAdminOrSuper, toggleCompanionStatus);
router.patch('/companions/:id/verify', requireSuperAdmin, verifyCompanion);

// Booking management routes
router.get('/bookings', requireAdminOrSuper, getAllBookings);
router.get('/bookings/stats', requireAdminOrSuper, getBookingStats);
router.get('/bookings/available-companions', requireAdminOrSuper, getAvailableCompanions);
router.post('/bookings/:bookingId/assign-companion', requireAdminOrSuper, assignCompanionToBooking);
router.get('/bookings/:id', requireAdminOrSuper, getBookingById);
router.put('/bookings/:id', requireAdminOrSuper, updateBooking);
router.delete('/bookings/:id', requireSuperAdmin, deleteBooking);

export default router;
