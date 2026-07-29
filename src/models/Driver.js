const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  vehicle: {
    type: {
      type: String,
      enum: ['bike', 'scooter', 'car', 'van'],
    },
    plate: String,
    model: String,
    color: String,
  },
  license: {
    number: String,
    expiryAt: Date,
    docUrl: String,
  },
  status: {
    type: String,
    enum: ['offline', 'online', 'busy'],
    default: 'offline',
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  lastLocationAt: Date,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  earningsBalance: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
