const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  defaultAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  savedAddresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
