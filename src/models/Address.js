const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  label: String,
  line1: {
    type: String,
    required: true,
  },
  line2: String,
  city: {
    type: String,
    required: true,
  },
  state: String,
  postalCode: String,
  country: {
    type: String,
    default: 'US',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  contactName: String,
  contactPhone: String,
  instructions: String,
}, {
  timestamps: true,
});

addressSchema.index({ location: '2dsphere' });
addressSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Address', addressSchema);
