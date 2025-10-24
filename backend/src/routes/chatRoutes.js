import express from 'express';
import {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage
} from '../controllers/chatController.js';
import {
  getAdminConversations,
  getAdminConversationMessages,
  assignConversation,
  sendAdminMessage
} from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// User routes (require user authentication)
router.use('/user', authenticateUser);

router.post('/user/conversation', createOrGetConversation);
router.get('/user/conversations', getUserConversations);
router.get('/user/conversation/:conversationId/messages', getConversationMessages);
router.post('/user/conversation/:conversationId/message', sendMessage);

// Admin routes (require admin authentication)
router.use('/admin', authenticateAdmin);

router.get('/admin/conversations', getAdminConversations);
router.get('/admin/conversation/:conversationId/messages', getAdminConversationMessages);
router.post('/admin/conversation/:conversationId/assign', assignConversation);
router.post('/admin/conversation/:conversationId/message', sendAdminMessage);

export default router;
