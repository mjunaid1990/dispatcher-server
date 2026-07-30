const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
  },
  permissions: [{
    type: String,
  }],
  isSystem: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

roleSchema.index({ name: 1 });
roleSchema.index({ slug: 1 });
roleSchema.index({ isActive: 1 });

module.exports = mongoose.model('Role', roleSchema);
