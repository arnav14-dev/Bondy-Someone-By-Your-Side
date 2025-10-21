import express from 'express';
import { signup, login, logout, getUserProfile, getCurrentUser } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (authentication required)
router.post('/logout', authenticateUser, logout);
router.get('/profile/:userId', authenticateUser, getUserProfile);
router.get('/me', authenticateUser, getCurrentUser);

export default router;