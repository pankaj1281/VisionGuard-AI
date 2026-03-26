/**
 * JWT Authentication middleware
 * Verifies Bearer tokens and attaches user to req.user
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('WARNING: JWT_SECRET is not set. Using an insecure default — set it in .env before deploying.');
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'change-this-secret-in-production';

/**
 * Generate a signed JWT for a user
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, EFFECTIVE_JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware: require a valid JWT to proceed
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);

    // Check if the user still exists and is not banned
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired, please log in again' });
    }
    next(err);
  }
};

/**
 * Middleware: optionally attach user if token is present (does not fail if absent)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Ignore invalid/expired tokens in optional mode
    next();
  }
};

/**
 * Middleware: require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { generateToken, requireAuth, optionalAuth, requireAdmin };
