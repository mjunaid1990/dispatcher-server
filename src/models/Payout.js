const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
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
  method: String,
  reference: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  periodStart: Date,
  periodEnd: Date,
  paidAt: Date,
}, {
  timestamps: true,
});

payoutSchema.index({ driverId: 1, createdAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);
