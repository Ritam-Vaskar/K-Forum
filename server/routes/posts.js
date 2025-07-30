import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all posts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { moderationStatus: 'approved' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const posts = await Post.find(query)
      .populate('author', 'name studentId year branch')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Post.countDocuments(query);

    // Hide author info for anonymous posts
    const processedPosts = posts.map(post => ({
      ...post,
      author: post.isAnonymous ? null : post.author,
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
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name studentId year branch');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    // Hide author info for anonymous posts
    const processedPost = {
      ...post.toObject(),
      author: post.isAnonymous ? null : post.author,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    };

    res.json(processedPost);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags, isAnonymous } = req.body;

    const post = new Post({
      title,
      content,
      author: req.userId,
      category,
      tags: tags || [],
      isAnonymous: isAnonymous || false
    });

    await post.save();
    await post.populate('author', 'name studentId year branch');

    const processedPost = {
      ...post.toObject(),
      author: post.isAnonymous ? null : post.author,
      upvoteCount: 0,
      downvoteCount: 0
    };

    res.status(201).json(processedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on post
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove existing votes
    post.upvotes = post.upvotes.filter(vote => !vote.user.equals(req.userId));
    post.downvotes = post.downvotes.filter(vote => !vote.user.equals(req.userId));

    // Add new vote
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
    .populate('author', 'name studentId year branch')
    .sort({ createdAt: -1 });

    const processedComments = comments.map(comment => ({
      ...comment.toObject(),
      author: comment.isAnonymous ? null : comment.author,
      upvoteCount: comment.upvotes.length,
      downvoteCount: comment.downvotes.length
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
    await comment.populate('author', 'name studentId year branch');

    // Update post comment count
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

export default router;