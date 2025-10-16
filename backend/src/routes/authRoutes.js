import express from 'express';
import { signup, login, logout, getUserProfile, getAllUsers } from '../controllers/authController.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile/:userId', getUserProfile);
router.get('/users', getAllUsers);

export default router;