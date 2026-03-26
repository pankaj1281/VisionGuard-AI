/**
 * Admin routes (admin role required)
 * GET    /api/admin/users              — list all users
 * PUT    /api/admin/users/:id/ban      — ban a user
 * PUT    /api/admin/users/:id/unban    — unban a user
 * GET    /api/admin/detections         — list all detections (paginated)
 * GET    /api/admin/stats              — platform-wide statistics
 */

const express = require('express');
const User = require('../models/User');
const Detection = require('../models/Detection');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments({})
    ]);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Could not retrieve users.' });
  }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: `User ${user.email} has been banned.`, user });
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({ error: 'Could not ban user.' });
  }
});

// PUT /api/admin/users/:id/unban
router.put('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: `User ${user.email} has been unbanned.`, user });
  } catch (err) {
    console.error('Unban user error:', err);
    res.status(500).json({ error: 'Could not unban user.' });
  }
});

// GET /api/admin/detections
router.get('/detections', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = req.query.filter;
    const query = {};
    if (filter === 'ai') query.result = 'AI Generated';
    if (filter === 'real') query.result = 'Real Image';

    const [detections, total] = await Promise.all([
      Detection.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Detection.countDocuments(query)
    ]);

    res.json({
      detections,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Admin detections error:', err);
    res.status(500).json({ error: 'Could not retrieve detections.' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      bannedUsers,
      totalDetections,
      aiDetections,
      realDetections,
      last24hDetections
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isBanned: true }),
      Detection.countDocuments({}),
      Detection.countDocuments({ result: 'AI Generated' }),
      Detection.countDocuments({ result: 'Real Image' }),
      Detection.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    res.json({
      stats: {
        users: { total: totalUsers, banned: bannedUsers, active: totalUsers - bannedUsers },
        detections: {
          total: totalDetections,
          ai: aiDetections,
          real: realDetections,
          last24h: last24hDetections
        }
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Could not retrieve platform stats.' });
  }
});

module.exports = router;
