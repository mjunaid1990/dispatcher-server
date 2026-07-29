const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  phone: String,
  email: String,
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  apiKeyHash: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Business', businessSchema);
