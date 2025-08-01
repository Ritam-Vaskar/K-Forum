import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUp, ArrowDown, MessageCircle, Eye, Clock, User, MoreVertical, Flag, Trash2 } from 'lucide-react';
import ImageViewer from '../ImageViewer';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

  const handleDelete = async () => {
    if (!user || !post.author || (user._id !== post.author._id && !user.isAdmin)) {
      toast.error('You do not have permission to delete this post');
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_API}/api/posts/${post._id}`);
      toast.success('Post deleted successfully');
      if (onDelete) onDelete(post._id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/posts/${post._id}/report`, {
        reason: reportReason
      });
      toast.success('Post reported successfully');
      setShowReportModal(false);
      setReportReason('');
      setShowOptions(false);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to report post');
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-[#17d059]/30 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
              {post.author?.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          <div>
            <p className="text-white font-medium">
              {post.author ? (
                <Link 
                  to={`/user/${post.author._id}`}
                  className="hover:text-[#17d059] transition-colors"
                >
                  {post.author.name} ({post.author.studentId})
                </Link>
              ) : 'Anonymous'}
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
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report Post</span>
                  </button>
                  {user && post.author && (user._id === post.author._id || user.isAdmin) && (
                    <button
                      onClick={handleDelete}
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

      <div className="mt-4 space-y-4">
        <Link to={`/post/${post._id}`} className="block">
          <h3 className="text-xl font-semibold text-white mb-3 hover:text-[#17d059] transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-300 mb-4 line-clamp-3">
            {post.content.substring(0, 200)}...
          </p>
        </Link>

        {/* Image attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                {index === 2 && post.attachments.length > 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">+{post.attachments.length - 3}</span>
                  </div>
                )}
              </div>
            )).slice(0, 3)}
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
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-[#17d059] text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ArrowUp className="w-5 h-5" />
            <span>{post.upvoteCount || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowDown className="w-5 h-5" />
            <span>{post.downvoteCount || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentCount || 0}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="w-5 h-5" />
          <span>{post.viewCount || 0}</span>
        </div>
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
                onClick={handleReport}
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
};

export default PostCard;