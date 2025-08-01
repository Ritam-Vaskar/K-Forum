import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Book, Code, Mail, Calendar } from 'lucide-react';
import PostCard from '../components/Posts/PostCard';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userResponse, postsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_API}/api/users/${id}`),
          axios.get(`${import.meta.env.VITE_BACKEND_API}/api/users/${id}/posts?page=${currentPage}`)
        ]);

        setUser(userResponse.data);
        setPosts(postsResponse.data.posts);
        setTotalPages(postsResponse.data.totalPages);
      } catch (error) {
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, currentPage]);

  const handlePostDelete = (deletedPostId) => {
    setPosts(posts.filter(post => post._id !== deletedPostId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#17d059] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#17d059] to-emerald-600 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-5 h-5 mr-2 text-[#17d059]" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Code className="w-5 h-5 mr-2 text-[#17d059]" />
                  <span>{user.studentId}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Book className="w-5 h-5 mr-2 text-[#17d059]" />
                  <span>{user.branch}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-5 h-5 mr-2 text-[#17d059]" />
                  <span>Year {user.year}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between text-gray-300">
              <div>
                <span className="text-2xl font-bold text-white">{user.postCount}</span>
                <span className="ml-2">Posts</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">{user.reputation}</span>
                <span className="ml-2">Reputation</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Posts</h2>
          {posts.length > 0 ? (
            <>
              {posts.map(post => (
                <PostCard key={post._id} post={post} onDelete={handlePostDelete} />
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${currentPage === page
                        ? 'bg-[#17d059] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;