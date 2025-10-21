import express from 'express';
import { 
  getUserLocations, 
  addUserLocation, 
  updateUserLocation, 
  deleteUserLocation, 
  setDefaultLocation,
  getRecentLocation 
} from '../controllers/userLocationController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/user-locations - Get all locations for user
router.get('/', getUserLocations);

// POST /api/user-locations - Add new location
router.post('/', addUserLocation);

// GET /api/user-locations/recent - Get most recent location
router.get('/recent', getRecentLocation);

// PUT /api/user-locations/:locationId - Update location
router.put('/:locationId', updateUserLocation);

// DELETE /api/user-locations/:locationId - Delete location
router.delete('/:locationId', deleteUserLocation);

// PUT /api/user-locations/:locationId/default - Set as default location
router.put('/:locationId/default', setDefaultLocation);

export default router;
