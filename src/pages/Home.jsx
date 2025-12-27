import React, { useState, useEffect } from 'react';
import axios from '../services/axiosSetup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/Posts/PostCard';
import TrendingHashtags from '../components/TrendingHashtags';
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

  // Categories (must match Post model enum)
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'academics', label: '📚 Academics' },
    { value: 'events', label: '🎉 Events' },
    { value: 'rants', label: '😤 Rants' },
    { value: 'internships', label: '💼 Internships' },
    { value: 'lost-found', label: '🔍 Lost & Found' },
    { value: 'clubs', label: '🏛️ Clubs' },
    { value: 'general', label: '💬 General' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm, sortBy, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory,
        sortBy,
        page,
        limit: 10
      };

      if (searchTerm.trim().startsWith('#')) {
        params.tag = searchTerm.trim().substring(1);
      } else if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      const response = await axios.get('/api/posts', { params });

      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages ?? 1);
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

  const [activeTab, setActiveTab] = useState('confessions'); // confessions | friends

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 z-50 animate-bounce-in"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-2 tracking-tight">
            {activeTab === 'confessions' ? 'Secret Confessions' : 'Campus Friends'}
          </h1>
          <p className="text-gray-400 text-lg">
            {activeTab === 'confessions' ? 'What happens at KIIT, stays on K-Forum.' : 'Connect with your batchmates anonymously.'}
          </p>
        </div>

        {/* Premium Toggle Switch */}
        <div className="glass-panel p-1 rounded-2xl flex relative w-full md:w-auto">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl transition-all duration-500 ease-out shadow-lg shadow-emerald-500/20 ${activeTab === 'friends' ? 'translate-x-full left-0' : 'left-1'}`}
          />
          <button
            onClick={() => setActiveTab('confessions')}
            className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'confessions' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            CONFESSIONS
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'friends' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            FRIENDS
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Filters (Sticky) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-400" />
                Filters
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-white/10 text-emerald-400 border-l-2 border-emerald-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  All Posts
                </button>
                {categories.filter(c => c.value !== 'all').map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value ? 'bg-white/10 text-emerald-400 border-l-2 border-emerald-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Feed */}
        <div className="lg:col-span-6">

          {/* Mobile Filter Bar (Visible only on small screens) */}
          <div className="lg:hidden glass-panel rounded-2xl p-4 mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold ${selectedCategory === cat.value ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-gray-900 rounded-2xl p-2 flex items-center glass-panel">
              <Search className="text-gray-500 w-5 h-5 ml-4" />
              <input
                type="text"
                placeholder="Search for secrets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-600"
              />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-gray-800 text-gray-300 text-sm rounded-xl px-4 py-2 border-none outline-none cursor-pointer hover:bg-gray-700 transition-colors mr-2"
              >
                <option value="createdAt">Newest</option>
                <option value="upvotes">Top</option>
                <option value="commentCount">Hot</option>
              </select>
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-3xl p-8 h-72 animate-pulse bg-gray-800/50" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post, idx) => (
                <div key={post._id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-bounce-in">
                  <PostCard post={post} />
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-12">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-6 py-3 rounded-xl glass-panel text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-6 py-3 rounded-xl glass-panel text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 px-6 glass-panel rounded-3xl border border-dashed border-gray-700">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No confessions found</h3>
              <p className="text-gray-400">Be the first to share a secret here.</p>
            </div>
          )}
        </div>

        {/* Right Column: Trending (Sticky) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">

            {/* Stats Card */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
              <h3 className="font-bold text-white mb-1">Campus Pulse</h3>
              <p className="text-xs text-gray-400 mb-4">Live Activity</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-emerald-400">24</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-cyan-400">{posts.length}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Posts</div>
                </div>
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                Trending Now
              </h3>
              <TrendingHashtags onTagClick={(tag) => {
                setSearchTerm(`#${tag}`);
                setPage(1);
              }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
