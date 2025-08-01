import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUp, ArrowDown, MessageCircle, Eye, Clock, User, Send, MoreVertical, Flag, Trash2, Image } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [showCommentOptions, setShowCommentOptions] = useState(null);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Post not found');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}/comments`);
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}/vote`, {
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

  const handleDeletePost = async () => {
    if (!user || (user._id !== post.author._id && !user.isAdmin)) {
      toast.error('You do not have permission to delete this post');
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}`);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const [showReportModal, setShowReportModal] = useState(false);
const [reportReason, setReportReason] = useState('');
const [showImageViewer, setShowImageViewer] = useState(false);
const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleReportPost = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}/report`, {
        reason: reportReason
      });
      toast.success('Post reported successfully');
      setShowReportModal(false);
      setReportReason('');
      setShowPostOptions(false);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to report post');
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to delete comment');
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
      setPost({
        ...post,
        commentCount: post.commentCount - 1
      });
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleReportComment = async (commentId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}/comments/${commentId}/report`);
      toast.success('Comment reported successfully');
      setShowCommentOptions(null);
    } catch (error) {
      toast.error('Failed to report comment');
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/posts/${id}/comments`, {
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

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">Report Post</h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please provide a reason for reporting this post..."
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-[#17d059] focus:ring-1 focus:ring-[#17d059] mb-4"
                rows="4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportPost}
                  className="px-4 py-2 rounded bg-[#17d059] text-white hover:bg-emerald-600"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Post */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center justify-between w-full">
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
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(post.category)}`}>
                  {post.category.replace('-', ' ').toUpperCase()}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowPostOptions(!showPostOptions)}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {showPostOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                      <button
                        onClick={handleReportPost}
                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report Post</span>
                      </button>
                      {user && (user._id === post.author._id || user.isAdmin) && (
                        <button
                          onClick={handleDeletePost}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Post</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          
          <div className="space-y-6">
            <div className="text-gray-300 mb-6 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Image attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {post.attachments.map((attachment, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowImageViewer(true);
                    }}
                  >
                    <img 
                      src={attachment.url} 
                      alt={attachment.filename}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Image className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Viewer Modal */}
          {showImageViewer && (
            <ImageViewer
              images={post.attachments.map(attachment => attachment.url)}
              initialIndex={selectedImageIndex}
              onClose={() => setShowImageViewer(false)}
            />
          )}

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
                <div className="flex items-start justify-between">
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
                  <div className="relative">
                    <button
                      onClick={() => setShowCommentOptions(showCommentOptions === comment._id ? null : comment._id)}
                      className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCommentOptions === comment._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                        <button
                          onClick={() => handleReportComment(comment._id)}
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg"
                        >
                          <Flag className="w-4 h-4" />
                          <span>Report Comment</span>
                        </button>
                        {user && (user._id === comment.author._id || user.isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Comment</span>
                          </button>
                        )}
                      </div>
                    )}
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