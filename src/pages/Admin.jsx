import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Shield, Users, MessageSquare, AlertTriangle, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchReportedPosts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReportedPosts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/admin/reported-posts`);
      setReportedPosts(response.data);
    } catch (error) {
      console.error('Error fetching reported posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/admin/moderate-post/${postId}`, { action });
      fetchReportedPosts();
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#17d059]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-[#17d059]" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">
            Welcome back, {user.name}. Manage the K-Forum community effectively.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-[#17d059]" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-white">{stats.totalPosts || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#17d059]" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Comments</p>
                <p className="text-2xl font-bold text-white">{stats.totalComments || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#17d059]" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Reports</p>
                <p className="text-2xl font-bold text-white">{stats.pendingReports || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Category Statistics */}
        {stats.categoryStats && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Posts by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.categoryStats.map((category) => (
                <div key={category._id} className="text-center">
                  <p className="text-2xl font-bold text-[#17d059]">{category.count}</p>
                  <p className="text-gray-400 capitalize">{category._id.replace('-', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reported Posts */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span>Reported Posts</span>
            </h2>
          </div>

          {reportedPosts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-[#17d059] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Reports</h3>
              <p className="text-gray-400">All posts are looking good! No reports to review.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {reportedPosts.map((post) => (
                <div key={post._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                      <p className="text-gray-300 mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>By: {post.author ? post.author.name : 'Anonymous'}</span>
                        <span>Category: {post.category}</span>
                        <span>Reports: {post.reports.length}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.moderationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      post.moderationStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                      post.moderationStatus === 'flagged' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {post.moderationStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Reports:</h4>
                    <div className="space-y-2">
                      {post.reports.map((report, index) => (
                        <div key={index} className="bg-gray-700/50 rounded p-3">
                          <p className="text-sm text-gray-300">
                            <span className="font-medium">
                              {report.user ? report.user.name : 'Anonymous'}
                            </span>
                            : {report.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(report.reportedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleModeratePost(post._id, 'approve')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleModeratePost(post._id, 'flag')}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flag</span>
                    </button>
                    <button
                      onClick={() => handleModeratePost(post._id, 'remove')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View Post</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;