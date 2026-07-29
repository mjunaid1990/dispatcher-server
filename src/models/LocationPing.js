const mongoose = require('mongoose');

const locationPingSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  speedKph: Number,
  heading: Number,
  batteryPct: Number,
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

locationPingSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 2592000 });
locationPingSchema.index({ driverId: 1, recordedAt: -1 });

module.exports = mongoose.model('LocationPing', locationPingSchema);
