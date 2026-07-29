const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: String,
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  readAt: Date,
  sentAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, sentAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
