/**
 * Dashboard routes (authenticated users)
 * GET  /api/dashboard/history        — paginated detection history for current user
 * GET  /api/dashboard/history/:id    — single detection detail
 * DELETE /api/dashboard/history/:id  — delete own detection
 * GET  /api/dashboard/stats          — aggregate stats for current user
 */

const express = require('express');
const Detection = require('../models/Detection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(requireAuth);

// GET /api/dashboard/history
router.get('/history', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Optional filter: ?filter=ai | ?filter=real
    const filter = req.query.filter;
    const query = { userId: req.user._id };
    if (filter === 'ai') query.result = 'AI Generated';
    if (filter === 'real') query.result = 'Real Image';

    const [detections, total] = await Promise.all([
      Detection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-ipAddress'), // exclude IP from client response
      Detection.countDocuments(query)
    ]);

    res.json({
      detections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Could not retrieve detection history.' });
  }
});

// GET /api/dashboard/history/:id
router.get('/history/:id', async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-ipAddress');

    if (!detection) {
      return res.status(404).json({ error: 'Detection record not found.' });
    }

    res.json({ detection });
  } catch (err) {
    console.error('Detection detail error:', err);
    res.status(500).json({ error: 'Could not retrieve detection.' });
  }
});

// DELETE /api/dashboard/history/:id
router.delete('/history/:id', async (req, res) => {
  try {
    const detection = await Detection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!detection) {
      return res.status(404).json({ error: 'Detection record not found.' });
    }

    res.json({ message: 'Detection deleted successfully.' });
  } catch (err) {
    console.error('Delete detection error:', err);
    res.status(500).json({ error: 'Could not delete detection.' });
  }
});

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, aiCount, realCount] = await Promise.all([
      Detection.countDocuments({ userId }),
      Detection.countDocuments({ userId, result: 'AI Generated' }),
      Detection.countDocuments({ userId, result: 'Real Image' })
    ]);

    // Average confidence across all analyses
    const avgResult = await Detection.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);

    res.json({
      stats: {
        total,
        aiCount,
        realCount,
        avgConfidence: avgResult[0] ? Math.round(avgResult[0].avgConfidence) : 0
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Could not retrieve stats.' });
  }
});

module.exports = router;
