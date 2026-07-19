const mongoose = require('mongoose');

const composerPostSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'twitter', 'reddit'],
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    mediaName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['posted', 'scheduled', 'draft'],
      default: 'posted',
    },
    scheduleAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ComposerPost', composerPostSchema);
