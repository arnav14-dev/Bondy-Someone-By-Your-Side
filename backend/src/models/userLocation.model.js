import mongoose from 'mongoose';

const userLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  locations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    flatNumber: {
      type: String,
      trim: true
    },
    buildingName: {
      type: String,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure maximum 3 locations per user
userLocationSchema.pre('save', function(next) {
  if (this.locations.length > 3) {
    return next(new Error('Maximum 3 locations allowed per user'));
  }
  next();
});

// Ensure only one default location per user
userLocationSchema.pre('save', function(next) {
  const defaultCount = this.locations.filter(loc => loc.isDefault).length;
  if (defaultCount > 1) {
    return next(new Error('Only one location can be set as default'));
  }
  next();
});

// Index for efficient queries
userLocationSchema.index({ userId: 1 });
userLocationSchema.index({ 'locations.lastUsed': -1 });

const UserLocation = mongoose.model('UserLocation', userLocationSchema);

export default UserLocation;
