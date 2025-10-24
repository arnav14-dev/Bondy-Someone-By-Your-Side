import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed', 'waiting'],
    default: 'waiting'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  subject: {
    type: String,
    maxlength: 200,
    default: 'General Inquiry'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  messageCount: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ 'participants.userId': 1, status: 1 });
conversationSchema.index({ assignedAdmin: 1, status: 1 });
conversationSchema.index({ status: 1, priority: 1 });
conversationSchema.index({ createdAt: -1 });

// Method to get conversation participants
conversationSchema.methods.getParticipants = function() {
  return this.participants.map(p => ({
    userId: p.userId,
    role: p.role,
    lastSeen: p.lastSeen
  }));
};

// Method to add participant
conversationSchema.methods.addParticipant = function(userId, role) {
  const existingParticipant = this.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      userId,
      role,
      lastSeen: new Date()
    });
  }
};

// Method to update last seen
conversationSchema.methods.updateLastSeen = function(userId) {
  const participant = this.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastSeen = new Date();
  }
};

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.userId.toString() === userId.toString()
  );
};

// Method to get other participants
conversationSchema.methods.getOtherParticipants = function(userId) {
  return this.participants.filter(p => 
    p.userId.toString() !== userId.toString()
  );
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;







