import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const pendingReports = await Post.countDocuments({ 'reports.0': { $exists: true } });

    const categoryStats = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      pendingReports,
      categoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reported posts
router.get('/reported-posts', auth, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name studentId')
      .populate('reports.user', 'name studentId')
      .sort({ 'reports.reportedAt': -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Moderate post
router.post('/moderate-post/:id', auth, isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'approve', 'flag', 'remove'
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { moderationStatus: action === 'approve' ? 'approved' : action },
      { new: true }
    );

    res.json({ message: `Post ${action}d successfully`, post });
  } catch (error) {
    console.error('Moderate post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;