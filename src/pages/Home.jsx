import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/Posts/PostCard';
import { Search, Filter, TrendingUp, Clock, Tag } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Categories for the dropdown
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
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              className="bg-[#17d059] hover:bg-[#15b84f] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </form>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Tag className="text-gray-400 w-5 h-5" />
              <span className="text-gray-300 whitespace-nowrap">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#17d059] focus:outline-none min-w-[160px]"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <span className="text-gray-300 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#17d059] focus:outline-none min-w-[140px]"
              >
                <option value="createdAt">Latest</option>
                <option value="upvotes">Most Upvoted</option>
                <option value="commentCount">Most Discussed</option>
                <option value="viewCount">Most Viewed</option>
              </select>
            </div>

            {/* Active Filter Indicator */}
            {selectedCategory !== 'all' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Filtered by:</span>
                <span className="bg-[#17d059] text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <span>{categories.find(cat => cat.value === selectedCategory)?.label}</span>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="hover:bg-[#15b84f] rounded-full p-0.5 ml-1"
                  >
                    <span className="text-xs">×</span>
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full">
          {loading ? (
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
                    <span> in {categories.find(cat => cat.value === selectedCategory)?.label}</span>
                  )}
                </p>
              </div>

              {/* Posts Grid */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
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
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
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