const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  raterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rateeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['driver', 'customer'],
    required: true,
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
}, {
  timestamps: true,
});

ratingSchema.index({ orderId: 1 });
ratingSchema.index({ rateeId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
