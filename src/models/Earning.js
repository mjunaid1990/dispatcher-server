const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  type: {
    type: String,
    enum: ['delivery', 'tip', 'bonus', 'adjustment'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  periodStart: Date,
  periodEnd: Date,
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

earningSchema.index({ driverId: 1, createdAt: -1 });
earningSchema.index({ payoutId: 1 });

module.exports = mongoose.model('Earning', earningSchema);
