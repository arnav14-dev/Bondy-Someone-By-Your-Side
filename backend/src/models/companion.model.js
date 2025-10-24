import mongoose from 'mongoose';

const companionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  governmentProof: {
    type: String,
    required: true
  },
  governmentProofOriginalName: {
    type: String,
    required: true
  },
  governmentProofPublicId: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 500
  },
  profilePicture: {
    type: String,
    default: null
  },
  profilePictureOriginalName: {
    type: String,
    default: null
  },
  profilePicturePublicId: {
    type: String,
    default: null
  },
  specialties: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    monday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    tuesday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    wednesday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    thursday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    friday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    saturday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    sunday: {
      available: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    }
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: { type: String, enum: ['id_proof', 'address_proof', 'certificate'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  languages: [{
    type: String,
    default: 'English'
  }],
  emergencyContact: {
    name: String,
    mobile: String,
    relation: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  }
}, {
  timestamps: true
});

// Index for better performance
companionSchema.index({ email: 1 });
companionSchema.index({ 'location.city': 1, 'location.state': 1 });
companionSchema.index({ specialties: 1 });
companionSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for full address
companionSchema.virtual('fullAddress').get(function() {
  return `${this.location.city}, ${this.location.state} - ${this.location.pincode}`;
});

// Method to check if companion is available at specific time
companionSchema.methods.isAvailableAt = function(date, time) {
  const dayOfWeek = date.toLowerCase();
  const dayAvailability = this.availability[dayOfWeek];
  
  if (!dayAvailability.available) return false;
  
  const requestedTime = time;
  const startTime = dayAvailability.startTime;
  const endTime = dayAvailability.endTime;
  
  return requestedTime >= startTime && requestedTime <= endTime;
};

// Method to get safe companion data (without sensitive info)
companionSchema.methods.toSafeObject = function() {
  const companionObject = this.toObject();
  delete companionObject.bankDetails;
  delete companionObject.verificationDocuments;
  return companionObject;
};

const Companion = mongoose.model('Companion', companionSchema);

export default Companion;