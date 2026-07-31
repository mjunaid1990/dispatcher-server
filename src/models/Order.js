const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  },
  pickup: {
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    line: String,
    contactName: String,
    contactPhone: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    scheduledAt: Date,
  },
  dropoff: {
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    line: String,
    contactName: String,
    contactPhone: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    scheduledAt: Date,
  },
  items: [{
    name: String,
    qty: Number,
    weightKg: Number,
    notes: String,
  }],
  packageSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  codAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['normal', 'express'],
    default: 'normal',
  },
  pricing: {
    base: Number,
    distanceFee: Number,
    surge: Number,
    tip: Number,
    total: Number,
    currency: {
      type: String,
      default: 'USD',
    },
  },
  distanceKm: Number,
  estimatedDurationMin: Number,
  etaAt: Date,
  assignedDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  assignedAt: Date,
  deliveredAt: Date,
  failureReason: String,
  proofOfDelivery: {
    photoUrl: String,
    signatureUrl: String,
    notes: String,
    capturedAt: Date,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ assignedDriverId: 1, status: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ 'pickup.location': '2dsphere' });
orderSchema.index({ 'dropoff.location': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
