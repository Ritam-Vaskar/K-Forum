import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PostCard from '../components/Posts/PostCard';
import { User, Mail, GraduationCap, Calendar, Trophy, MessageCircle, ThumbsUp, Edit3 } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    year: '',
    branch: ''
  });

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${id}`);
      setProfile(response.data);
      setEditData({
        name: response.data.name,
        year: response.data.year,
        branch: response.data.branch
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${id}/posts`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile', editData);
      setProfile({ ...profile, ...response.data });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#17d059]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profile not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                {editMode ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none"
                    />
                    <select
                      value={editData.year}
                      onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    <input
                      type="text"
                      value={editData.branch}
                      onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#17d059] text-white py-2 rounded-lg hover:bg-[#15b84f] transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
                    <p className="text-gray-400 mb-4">{profile.studentId}</p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-[#17d059] text-white px-4 py-2 rounded-lg hover:bg-[#15b84f] transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-[#17d059]" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <GraduationCap className="w-5 h-5 text-[#17d059]" />
                  <span>{profile.year}th Year • {profile.branch}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-[#17d059]" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Trophy className="w-5 h-5 text-[#17d059]" />
                  <span>{profile.reputation} Reputation</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#17d059]">{profile.postCount || 0}</div>
                    <div className="text-sm text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#17d059]">{profile.reputation || 0}</div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {profile.badges && profile.badges.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#17d059]/10 text-[#17d059] text-sm rounded-full border border-[#17d059]/30"
                      >
                        {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isOwnProfile ? 'Your Posts' : `${profile.name}'s Posts`}
              </h2>
              <p className="text-gray-400">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'} • Only public posts are shown
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400">
                  {isOwnProfile ? "You haven't created any posts yet." : "This user hasn't created any public posts yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;