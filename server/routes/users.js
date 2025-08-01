import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { auth } from '../middleware/auth.js';
import { uploadImage } from '../config/cloudinary.js';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationOTP -otpExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ 
      author: user._id,
      moderationStatus: 'approved'
    });

    res.json({
      ...user.toObject(),
      postCount
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, year, branch } = req.body;
    const updateData = { name, year, branch };

    // Handle avatar upload if file is present
    if (req.file) {
      try {
        // Convert buffer to base64
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const avatarUrl = await uploadImage(base64Image);
        updateData.avatar = avatarUrl;
      } catch (error) {
        console.error('Avatar upload error:', error);
        return res.status(400).json({ message: 'Failed to upload avatar' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find({ 
      author: req.params.id,
      moderationStatus: 'approved',
      isAnonymous: false // Only show non-anonymous posts on profile
    })
    .populate('author', 'name studentId year branch')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Post.countDocuments({ 
      author: req.params.id,
      moderationStatus: 'approved',
      isAnonymous: false
    });

    const processedPosts = posts.map(post => ({
      ...post.toObject(),
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    }));

    res.json({
      posts: processedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;