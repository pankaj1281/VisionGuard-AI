/**
 * Detection model - stores each image analysis result
 */

const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for anonymous/unauthenticated analyses
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    result: {
      type: String,
      enum: ['AI Generated', 'Real Image'],
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    // Raw probability scores from the AI API
    aiScore: {
      type: Number,
      min: 0,
      max: 1
    },
    realScore: {
      type: Number,
      min: 0,
      max: 1
    },
    // Detected signals / explanations from the API
    signals: {
      type: [String],
      default: []
    },
    // IP address for rate-limiting reference (stored hashed/anonymised)
    ipAddress: {
      type: String
    },
    // API provider used for this detection
    apiProvider: {
      type: String,
      default: 'sightengine'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster user-history lookups
detectionSchema.index({ userId: 1, createdAt: -1 });
detectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Detection', detectionSchema);
