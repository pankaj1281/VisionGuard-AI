/**
 * Detection route — POST /api/detect
 *
 * Accepts an uploaded image, compresses it with sharp, sends it to the
 * Sightengine AI-generated image detection API, and returns a structured result.
 *
 * Sightengine docs: https://sightengine.com/docs/check-image-ai-generated
 * Required env vars: SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET
 */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
const Detection = require('../models/Detection');
const { detectRateLimiter } = require('../middleware/rateLimiter');
const { multerFileFilter, validateUpload, MAX_FILE_SIZE_BYTES } = require('../middleware/fileValidation');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Store file in memory (no disk writes) for security and performance
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: multerFileFilter
});

/**
 * Build a human-readable list of signals/explanations based on API scores
 */
const buildSignals = (apiData) => {
  const signals = [];

  if (apiData.type && apiData.type.ai_generated > 0.5) {
    signals.push('AI-generated patterns detected');
  }
  if (apiData.type && apiData.type.ai_generated > 0.8) {
    signals.push('Strong AI synthesis artifacts present');
  }
  if (apiData.type && apiData.type.ai_generated <= 0.5) {
    signals.push('Natural photographic characteristics observed');
  }
  if (apiData.type && apiData.type.ai_generated <= 0.2) {
    signals.push('Consistent sensor noise profile');
    signals.push('Natural lighting and shadow distribution');
  }

  return signals;
};

/**
 * Compress and normalise the uploaded image using sharp.
 * Reduces payload size and standardises input for the AI API.
 */
const compressImage = async (buffer) => {
  let sharpInstance = sharp(buffer);

  // Resize to max 1024px on longest side while preserving aspect ratio
  sharpInstance = sharpInstance.resize(1024, 1024, {
    fit: 'inside',
    withoutEnlargement: true
  });

  // Output as JPEG for consistent API input
  const compressed = await sharpInstance
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();

  return compressed;
};

/**
 * POST /api/detect
 * Analyse an uploaded image for AI-generation.
 *
 * Request: multipart/form-data with field "image"
 * Response: { result, confidence, aiScore, realScore, signals, detectionId }
 */
/**
 * Wrap multer to return 415 instead of 500 on unsupported file type errors
 */
const multerMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
      }
      // Multer file filter rejection
      return res.status(415).json({ error: err.message || 'Unsupported file type.' });
    }
    next();
  });
};

router.post(
  '/',
  detectRateLimiter,
  optionalAuth,
  multerMiddleware,
  validateUpload,
  async (req, res) => {
    try {
      // Compress the image before sending to external API
      const compressed = await compressImage(req.file.buffer);

      // Check if API credentials are configured
      const apiUser = process.env.SIGHTENGINE_API_USER;
      const apiSecret = process.env.SIGHTENGINE_API_SECRET;

      if (!apiUser || !apiSecret) {
        return res.status(503).json({
          error:
            'AI detection API is not configured. Set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET in your .env file.'
        });
      }

      // Build multipart form for Sightengine
      const form = new FormData();
      form.append('media', compressed, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      form.append('models', 'genai');
      form.append('api_user', apiUser);
      form.append('api_secret', apiSecret);

      // Call Sightengine API
      const response = await axios.post(
        'https://api.sightengine.com/1.0/check.json',
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000 // 30-second timeout
        }
      );

      const data = response.data;

      if (data.status !== 'success') {
        console.error('Sightengine API error:', data);
        return res.status(502).json({ error: 'AI detection API returned an error. Please try again.' });
      }

      // Extract AI/real probability scores (0–1 range)
      const aiScore = data.type?.ai_generated ?? 0;
      const realScore = 1 - aiScore;

      // Determine result label and confidence
      const isAI = aiScore > 0.5;
      const result = isAI ? 'AI Generated' : 'Real Image';
      const confidence = Math.round((isAI ? aiScore : realScore) * 100);

      const signals = buildSignals(data);

      // Persist result to DB if MongoDB is connected
      let detectionId = null;
      try {
        const detection = await Detection.create({
          userId: req.user ? req.user._id : null,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          result,
          confidence,
          aiScore,
          realScore,
          signals,
          ipAddress: req.ip,
          apiProvider: 'sightengine'
        });
        detectionId = detection._id;

        // Increment user's analysis counter
        if (req.user) {
          await req.user.updateOne({ $inc: { analysisCount: 1 } });
        }
      } catch (dbErr) {
        // DB errors are non-fatal — still return the detection result
        console.warn('Could not save detection to DB:', dbErr.message);
      }

      res.json({
        result,
        confidence,
        aiScore: parseFloat(aiScore.toFixed(4)),
        realScore: parseFloat(realScore.toFixed(4)),
        signals,
        detectionId
      });
    } catch (err) {
      if (err.response) {
        // Axios HTTP error from Sightengine
        console.error('Sightengine HTTP error:', err.response.status, err.response.data);
        return res.status(502).json({ error: 'AI API request failed. Please try again later.' });
      }
      console.error('Detection error:', err);
      res.status(500).json({ error: 'Internal server error during image analysis.' });
    }
  }
);

module.exports = router;
