const mongoose = require('mongoose');

const proofOfDeliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  photoUrls: [String],
  signatureUrl: String,
  receiverName: String,
  otpVerified: {
    type: Boolean,
    default: false,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  },
  capturedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProofOfDelivery', proofOfDeliverySchema);
