const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
  baseFare: {
    type: Number,
    default: 0,
  },
  perKmRate: {
    type: Number,
    default: 0,
  },
  surgeMultiplier: {
    type: Number,
    default: 1.0,
    min: 1.0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

zoneSchema.index({ polygon: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);
