import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import { z } from 'zod';

// Validation schemas
const createConversationSchema = z.object({
  subject: z.string().max(200).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional()
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long'),
  messageType: z.enum(['text', 'image', 'file']).optional(),
  replyTo: z.string().optional()
});

// Create or get conversation
export const createOrGetConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, priority } = req.body;

    console.log(userId);
    // Validate input
    const validatedData = createConversationSchema.parse({ subject, priority });

    // Check if user has an active conversation
    let conversation = await Conversation.findOne({
      'participants.userId': userId,
      status: { $in: ['active', 'waiting'] }
    }).populate('participants.userId', 'username contactNumber');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [{
          userId,
          role: 'user',
          lastSeen: new Date()
        }],
        subject: validatedData.subject || 'General Inquiry',
        priority: validatedData.priority || 'normal',
        status: 'waiting'
      });

      await conversation.save();
      console.log('New conversation created and saved:', conversation._id, 'Status:', conversation.status, 'AssignedAdmin:', conversation.assignedAdmin);
    }

    // Populate conversation with latest message
    const latestMessage = await Message.findOne({
      conversationId: conversation._id
    }).sort({ createdAt: -1 });

    if (latestMessage) {
      conversation.lastMessage = {
        content: latestMessage.content,
        sender: latestMessage.sender.userId,
        timestamp: latestMessage.createdAt
      };
    }

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: {
        conversation: {
          _id: conversation._id,
          participants: conversation.getParticipants(),
          status: conversation.status,
          priority: conversation.priority,
          subject: conversation.subject,
          assignedAdmin: conversation.assignedAdmin,
          lastMessage: conversation.lastMessage,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    
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

// Get user conversations
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      'participants.userId': userId
    })
    .populate('participants.userId', 'username contactNumber')
    .populate('assignedAdmin', 'username contactNumber')
    .sort({ updatedAt: -1 });

    // Get latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const latestMessage = await Message.findOne({
          conversationId: conversation._id
        }).sort({ createdAt: -1 });

        return {
          _id: conversation._id,
          participants: conversation.getParticipants(),
          status: conversation.status,
          priority: conversation.priority,
          subject: conversation.subject,
          assignedAdmin: conversation.assignedAdmin,
          lastMessage: latestMessage ? {
            content: latestMessage.content,
            sender: latestMessage.sender.userId,
            timestamp: latestMessage.createdAt
          } : null,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: {
        conversations: conversationsWithMessages
      }
    });

  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get conversation messages
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        data: null
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        data: null
      });
    }

    // Get messages with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .populate('sender.userId', 'username contactNumber')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        'sender.userId': { $ne: userId },
        isRead: false
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        },
        $set: { isRead: true }
      }
    );

    // Update conversation last seen
    conversation.updateLastSeen(userId);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(conversation.messageCount / Math.max(parseInt(limit), 1)),
          hasNext: skip + messages.length < conversation.messageCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const { content, messageType = 'text', replyTo } = req.body;

    // Validate input
    const validatedData = sendMessageSchema.parse({ content, messageType, replyTo });

    // Check if conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        data: null
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        data: null
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: {
        userId,
        role: 'user',
        name: user.username
      },
      content: validatedData.content,
      messageType: validatedData.messageType,
      replyTo: validatedData.replyTo || null
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
    conversation.updateLastSeen(userId);
    await conversation.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender.userId', 'username contactNumber')
      .populate('replyTo', 'content sender');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    
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

// Get admin conversations
export const getAdminConversations = async (req, res) => {
  try {
    const adminId = req.adminId;
    const { status = '', priority = '', page = 1, limit = 20 } = req.query;

    console.log('Admin ID:', adminId);
    console.log('Query params:', { status, priority, page, limit });

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Get conversations assigned to admin or unassigned
    filter.$or = [
      { assignedAdmin: adminId },
      { assignedAdmin: null, status: 'waiting' }
    ];

    console.log('Filter:', JSON.stringify(filter, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await Conversation.find(filter)
      .populate('participants.userId', 'username contactNumber')
      .populate('assignedAdmin', 'username contactNumber')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found conversations:', conversations.length);
    console.log('Conversations:', conversations.map(c => ({ id: c._id, status: c.status, assignedAdmin: c.assignedAdmin })));
    
    // Debug: Check all conversations in database
    const allConversations = await Conversation.find({}).select('_id status assignedAdmin participants');
    console.log('All conversations in database:', allConversations.length);
    console.log('All conversations:', allConversations.map(c => ({ 
      id: c._id, 
      status: c.status, 
      assignedAdmin: c.assignedAdmin,
      participants: c.participants.map(p => ({ userId: p.userId, role: p.role }))
    })));

    // Get latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const latestMessage = await Message.findOne({
          conversationId: conversation._id
        }).sort({ createdAt: -1 });

        return {
          _id: conversation._id,
          participants: conversation.getParticipants(),
          status: conversation.status,
          priority: conversation.priority,
          subject: conversation.subject,
          assignedAdmin: conversation.assignedAdmin,
          lastMessage: latestMessage ? {
            content: latestMessage.content,
            sender: latestMessage.sender.userId,
            timestamp: latestMessage.createdAt
          } : null,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        };
      })
    );

    const total = await Conversation.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Admin conversations retrieved successfully',
      data: {
        conversations: conversationsWithMessages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalConversations: total,
          hasNext: skip + conversations.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Assign conversation to admin
export const assignConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const adminId = req.adminId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        data: null
      });
    }

    conversation.assignedAdmin = adminId;
    conversation.status = 'active';
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation assigned successfully',
      data: {
        conversation: {
          _id: conversation._id,
          assignedAdmin: conversation.assignedAdmin,
          status: conversation.status
        }
      }
    });

  } catch (error) {
    console.error('Assign conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Get admin conversation messages
export const getAdminConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const adminId = req.adminId;
    const { page = 1, limit = 50 } = req.query;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        data: null
      });
    }

    // Check if admin has access to this conversation
    if (conversation.assignedAdmin && conversation.assignedAdmin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        data: null
      });
    }

    // Get messages with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .populate('sender.userId', 'username contactNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Mark messages as read by admin
    await Message.updateMany(
      {
        conversationId,
        'sender.userId': { $ne: adminId },
        isRead: false
      },
      {
        $push: {
          readBy: {
            userId: adminId,
            readAt: new Date()
          }
        },
        $set: { isRead: true }
      }
    );

    // Update conversation last seen
    conversation.updateLastSeen(adminId);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(conversation.messageCount / Math.max(parseInt(limit), 1)),
          hasNext: skip + messages.length < conversation.messageCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// Send admin message
export const sendAdminMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const adminId = req.adminId;
    const { content, messageType = 'text' } = req.body;

    // Validate input
    const validatedData = sendMessageSchema.parse({ content, messageType });

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        data: null
      });
    }

    // Get admin info
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        data: null
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: {
        userId: adminId,
        role: 'admin',
        name: admin.name
      },
      content: validatedData.content,
      messageType: validatedData.messageType
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
    conversation.updateLastSeen(adminId);
    await conversation.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender.userId', 'username contactNumber');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage
      }
    });

  } catch (error) {
    console.error('Send admin message error:', error);
    
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
