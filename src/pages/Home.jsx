import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/Posts/PostCard';
import { Search, Filter, Tag, Plus } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'events', label: 'Events' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'help', label: 'Help & Support' },
    { value: 'social', label: 'Social' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'clubs', label: 'Clubs & Societies' },
    { value: 'opportunities', label: 'Opportunities' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm, sortBy, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/posts`, {
        params: {
          category: selectedCategory,
          search: searchTerm,
          sortBy,
          page,
          limit: 10
        }
      });

      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages ?? 1); // FIX ✔
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/create-post');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-4 right-4 bg-[#17d059] hover:bg-[#15b84f] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to <span className="text-[#17d059]">K-Forum</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your secure community platform for KIIT students. Share, discuss, and connect anonymously or publicly.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-[#17d059] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#17d059] hover:bg-[#15b84f] text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Tag className="text-gray-400 w-5 h-5" />
              <span className="text-gray-300">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#17d059]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <span className="text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#17d059]"
              >
                <option value="createdAt">Latest</option>
                <option value="upvotes">Most Upvoted</option>
                <option value="commentCount">Most Discussed</option>
                <option value="viewCount">Most Viewed</option>
              </select>
            </div>

          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full">

          {loading ? (
            /* Loading Skeletons */
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>

          ) : posts.length === 0 ? (

            /* No Posts Found */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
              <p className="text-gray-400">
                {selectedCategory !== 'all' || searchTerm 
                  ? 'Try adjusting your search or category filter.' 
                  : 'Be the first to share something with the community!'}
              </p>
            </div>

          ) : (

            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
                  {selectedCategory !== 'all' && (
                    <span> in {categories.find(c => c.value === selectedCategory)?.label}</span>
                  )}
                </p>
              </div>

              {/* Posts List */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">

                  {/* Previous */}
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg ${
                      page === 1
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers (SAFE FIXED VERSION) */}
                  {[...Array(Math.min(5, totalPages || 1))].map((_, i) => {
                    const offset = Math.max(1, Math.min(totalPages - 4, page - 2));
                    const pageNum = offset + i;

                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          page === pageNum
                            ? 'bg-[#17d059] text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      page === totalPages
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Next
                  </button>

                </div>
              )}

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;
