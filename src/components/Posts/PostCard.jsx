import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Eye, Clock, User } from 'lucide-react';

const PostCard = ({ post }) => {
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-[#17d059]/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
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

      <Link to={`/post/${post._id}`} className="block">
        <h3 className="text-xl font-semibold text-white mb-3 hover:text-[#17d059] transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-300 mb-4 line-clamp-3">
          {post.content.substring(0, 200)}...
        </p>
      </Link>

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
    </div>
  );
};

export default PostCard;