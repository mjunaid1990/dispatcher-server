const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  type: {
    type: String,
    enum: ['pickup', 'dropoff'],
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
  etaAt: Date,
  completedAt: Date,
}, { _id: false });

const routeSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  stops: [stopSchema],
  totalDistanceKm: Number,
  totalDurationMin: Number,
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned',
  },
}, {
  timestamps: true,
});

routeSchema.index({ driverId: 1, date: -1 });

module.exports = mongoose.model('Route', routeSchema);
