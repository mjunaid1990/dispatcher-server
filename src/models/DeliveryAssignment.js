const mongoose = require('mongoose');

const deliveryAssignmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  offeredAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: Date,
  response: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
  },
  expiresAt: Date,
  rejectReason: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
