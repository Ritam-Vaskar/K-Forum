import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { auth } from '../middleware/auth.js';
import { uploadImage } from '../config/cloudinary.js';
import multer from 'multer';
import { moderateText } from '../services/aiModeration.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
});

const router = express.Router();

// Get trending hashtags
router.get('/trending/hashtags', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingTags = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          $or: [
            { status: 'PUBLISHED' },
            { status: { $exists: false }, moderationStatus: 'approved' }
          ]
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(trendingTags);
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (only PUBLISHED)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      tag,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Include both old posts (moderationStatus=approved) and new posts (status=PUBLISHED)
    let query = {
      $or: [
        { status: 'PUBLISHED' },
        { status: { $exists: false }, moderationStatus: 'approved' }
      ]
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    } else if (search) {
      query.$text = { $search: search };
    }

    const posts = await Post.find(query)
      .populate('author', 'name studentId year branch avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Post.countDocuments(query);

    const processedPosts = posts.map(post => ({
      ...post,
      author: post.isAnonymous ? null : post.author,
      upvoteCount: post.upvotes?.length || 0,
      downvoteCount: post.downvotes?.length || 0
    }));

    res.json({
      posts: processedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name studentId year branch avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    const processedPost = {
      ...post.toObject(),
      author: post.isAnonymous ? null : post.author,
      upvoteCount: post.upvotes?.length || 0,
      downvoteCount: post.downvotes?.length || 0
    };

    res.json(processedPost);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// CREATE POST - With AI Moderation
// ============================================
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content, category, tags, isAnonymous } = req.body;

    // --- AI MODERATION ---
    const textToAnalyze = `${title}\n${content}`;
    console.log('Analyzing content for moderation...');

    const moderationResult = await moderateText(textToAnalyze);
    console.log('Moderation Result:', moderationResult);

    // Determine status based on moderation
    // SAFE (confidence < 0.45) → PUBLISHED
    // UNSAFE (confidence >= 0.45) → PENDING_REVIEW (admin will decide)
    const status = moderationResult.isUnsafe ? 'PENDING_REVIEW' : 'PUBLISHED';

    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const extractedHashtags = [];
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      extractedHashtags.push(match[1].toLowerCase());
    }

    // Handle image uploads
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          const imageUrl = await uploadImage(base64Image);
          attachments.push({
            url: imageUrl,
            type: 'image',
            filename: file.originalname
          });
        } catch (error) {
          console.warn('Image upload failed (skipping):', error.message);
        }
      }
    }

    const cleanAttachments = attachments.map(attachment => ({
      url: attachment.url.trim(),
      type: attachment.type,
      filename: attachment.filename
    }));

    const manualTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [];
    const allTags = [...new Set([...manualTags, ...extractedHashtags])];

    const post = new Post({
      title: title.trim(),
      content: content.trim(),
      author: req.userId,
      category,
      tags: allTags,
      isAnonymous: isAnonymous === 'true',
      attachments: cleanAttachments,

      // New moderation fields
      status,
      moderation: {
        isUnsafe: moderationResult.isUnsafe,
        confidence: moderationResult.confidence,
        categories: moderationResult.categories || [],
        flaggedWords: moderationResult.flaggedWords || [],
        language: moderationResult.language || 'unknown'
      },

      // Keep old field for backward compatibility
      moderationStatus: status === 'PUBLISHED' ? 'approved' : 'flagged'
    });

    await post.save();
    await post.populate('author', 'name studentId year branch avatar');

    const processedPost = {
      ...post.toObject(),
      author: post.isAnonymous ? null : post.author,
      upvoteCount: 0,
      downvoteCount: 0
    };

    // Return appropriate message
    res.status(201).json({
      message: status === 'PUBLISHED'
        ? 'Post published successfully!'
        : 'Post submitted for admin review. It will be visible once approved.',
      post: processedPost,
      moderationStatus: status
    });

  } catch (error) {
    console.error('Create post error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'File upload error',
        error: error.message
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on post
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.upvotes = post.upvotes.filter(vote => !vote.user.equals(req.userId));
    post.downvotes = post.downvotes.filter(vote => !vote.user.equals(req.userId));

    if (voteType === 'up') {
      post.upvotes.push({ user: req.userId });
    } else if (voteType === 'down') {
      post.downvotes.push({ user: req.userId });
    }

    await post.save();

    res.json({
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.id,
      moderationStatus: 'approved'
    })
      .populate('author', 'name studentId year branch avatar')
      .sort({ createdAt: -1 });

    const processedComments = comments.map(comment => ({
      ...comment.toObject(),
      author: comment.isAnonymous ? null : comment.author,
      upvoteCount: comment.upvotes?.length || 0,
      downvoteCount: comment.downvotes?.length || 0
    }));

    res.json(processedComments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content, isAnonymous, parentComment } = req.body;

    const comment = new Comment({
      content,
      author: req.userId,
      post: req.params.id,
      isAnonymous: isAnonymous || false,
      parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('author', 'name studentId year branch avatar');

    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { commentCount: 1 }
    });

    const processedComment = {
      ...comment.toObject(),
      author: comment.isAnonymous ? null : comment.author,
      upvoteCount: 0,
      downvoteCount: 0
    };

    res.status(201).json(processedComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.author.equals(req.userId) && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Comment.deleteMany({ post: req.params.id });
    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report post
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingReport = post.reports.find(report => report.user.equals(req.userId));
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    post.reports.push({
      user: req.userId,
      reason
    });

    if (post.reports.length >= 5 && post.status === 'PUBLISHED') {
      post.status = 'PENDING_REVIEW';
      post.moderationStatus = 'flagged';
    }

    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;