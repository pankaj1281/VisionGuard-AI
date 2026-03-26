/**
 * Rate limiting middleware
 * - Global limiter: 100 requests / 15 minutes per IP
 * - Detection limiter: 20 analyses / 15 minutes per IP (stricter)
 */

const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

const detectRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many image analyses from this IP. Please wait before analysing more images.'
  }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.'
  }
});

module.exports = { globalRateLimiter, detectRateLimiter, authRateLimiter };
