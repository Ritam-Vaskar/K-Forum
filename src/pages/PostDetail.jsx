import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUp, ArrowDown, MessageCircle, Eye, Clock, User, Send } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Post not found');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${id}/vote`, {
        voteType
      });
      setPost({
        ...post,
        upvoteCount: response.data.upvoteCount,
        downvoteCount: response.data.downvoteCount
      });
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${id}/comments`, {
        content: newComment,
        isAnonymous: isAnonymousComment
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      setPost({
        ...post,
        commentCount: post.commentCount + 1
      });
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      academics: 'bg-blue-500',
      events: 'bg-purple-500',
      rants: 'bg-red-500',
      internships: 'bg-[#17d059]',
      'lost-found': 'bg-yellow-500',
      clubs: 'bg-indigo-500',
      general: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#17d059]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
          <Link to="/" className="text-[#17d059] hover:text-emerald-400">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Post */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {post.author ? `${post.author.name} (${post.author.studentId})` : 'Anonymous'}
                </p>
                <p className="text-gray-400 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(post.createdAt)}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(post.category)}`}>
              {post.category.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          
          <div className="text-gray-300 mb-6 whitespace-pre-wrap">
            {post.content}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-[#17d059] text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleVote('up')}
                className="flex items-center space-x-2 text-gray-400 hover:text-[#17d059] transition-colors"
              >
                <ArrowUp className="w-5 h-5" />
                <span>{post.upvoteCount || 0}</span>
              </button>
              <button
                onClick={() => handleVote('down')}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <ArrowDown className="w-5 h-5" />
                <span>{post.downvoteCount || 0}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-400">
                <MessageCircle className="w-5 h-5" />
                <span>{post.commentCount || 0}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Eye className="w-5 h-5" />
              <span>{post.viewCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Add Comment */}
        {user && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Add a Comment</h3>
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors resize-none"
                rows="4"
                required
              />
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center space-x-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={isAnonymousComment}
                    onChange={(e) => setIsAnonymousComment(e.target.checked)}
                    className="rounded border-gray-600 text-[#17d059] focus:ring-[#17d059]"
                  />
                  <span>Comment anonymously</span>
                </label>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-[#17d059] hover:bg-[#15b84f] text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Comments ({comments.length})
          </h3>
          {comments.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-white font-medium">
                        {comment.author ? `${comment.author.name} (${comment.author.studentId})` : 'Anonymous'}
                      </p>
                      <span className="text-gray-400 text-sm">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <ArrowUp className="w-4 h-4" />
                        <span>{comment.upvoteCount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <ArrowDown className="w-4 h-4" />
                        <span>{comment.downvoteCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;