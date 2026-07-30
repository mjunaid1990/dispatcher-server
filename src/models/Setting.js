const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  category: {
    type: String,
    enum: ['smtp', 'sms', 'push', 'general', 'role'],
    default: 'general',
  },
  description: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
settingSchema.index({ key: 1 });
settingSchema.index({ category: 1 });

module.exports = mongoose.model('Setting', settingSchema);
