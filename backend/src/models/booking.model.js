import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['elderly-care', 'shopping', 'medical', 'social', 'transportation', 'household', 'other']
  },
  taskDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  duration: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '6', '8', 'full-day']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  companionGender: {
    type: String,
    enum: ['', 'female', 'male', 'any']
  },
  companionAge: {
    type: String,
    enum: ['', '18-25', '26-35', '36-50', '50+']
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  budget: {
    type: String,
    enum: ['', '15-25', '25-35', '35-50', '50+', 'negotiable']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedCompanion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ serviceType: 1, status: 1 });

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for formatted time
bookingSchema.virtual('formattedTime').get(function() {
  return this.time;
});

// Method to check if booking is active
bookingSchema.methods.isActive = function() {
  return ['pending', 'confirmed', 'in-progress'].includes(this.status);
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
