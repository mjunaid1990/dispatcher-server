const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  status: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  },
  note: String,
}, {
  timestamps: true,
});

trackingEventSchema.index({ orderId: 1, createdAt: -1 });

module.exports = mongoose.model('TrackingEvent', trackingEventSchema);
