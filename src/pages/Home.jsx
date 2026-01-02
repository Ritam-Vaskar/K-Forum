import React, { useState, useEffect } from 'react';
import axios from '../services/axiosSetup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/Posts/PostCard';
import TrendingHashtags from '../components/TrendingHashtags';
import { Search, Filter, Tag, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('confessions'); // confessions | friends

  // Categories (must match Post model enum)
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'academics', label: '📚 Academics' },
    { value: 'events', label: '🎉 Events' },
    { value: 'Confessions', label: '🥹 Confessions' },
    { value: 'internships', label: '💼 Internships' },
    { value: 'lost-found', label: '🔍 Lost & Found' },
    { value: 'clubs', label: '🏛️ Clubs' },
    { value: 'general', label: '💬 General' },
    { value: 'Bookies', label: '🤖 Bookies' }
  ];

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm, sortBy, page, activeTab]);

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

      // Handle Tab-based filtering
      if (activeTab === 'confessions') {
        // Post Section: Exclude Bookies
        if (selectedCategory === 'all') {
          params.excludeCategory = 'Bookies';
        }
      } else if (activeTab === 'friends') {
        // Bookie Section: Show only Bookies
        // Force category to Bookies if users try to switch (though UI should prevent it)
        if (selectedCategory === 'all') {
          params.category = 'Bookies';
        }
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



  return (
    <div className="relative min-h-[calc(100vh-4rem)]">

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 z-50 animate-bounce-in"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Inline Header: Search Bar + Filter + Sort + Switch */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">
        {/* Search Bar (Left) with Inline Sort */}
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
          <div className="relative bg-[#1a1f2e]/60 backdrop-blur-xl rounded-2xl p-1.5 flex items-center border border-white/5">
            <Search className="text-gray-500 w-4 h-4 ml-3" />
            <input
              type="text"
              placeholder={activeTab === 'confessions' ? "Search posts..." : "Search bookies..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white px-3 py-2 text-sm focus:outline-none placeholder-gray-600"
            />
            {/* Sort Select Integrated into Search Bar */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white/5 text-gray-300 text-xs font-bold rounded-xl px-3 py-2 border-none outline-none cursor-pointer hover:bg-white/10 transition-all ml-2 whitespace-nowrap"
            >
              <option value="createdAt">Newest</option>
              <option value="upvotes">Top</option>
              <option value="commentCount">Hot</option>
            </select>
          </div>
        </div>

        {/* Switch Toggle (Right) - Enlarged */}
        <div className="glass-panel p-1 rounded-2xl flex relative shrink-0 h-[52px] min-w-[220px]">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl transition-all duration-500 ease-out shadow-lg shadow-emerald-500/20 ${activeTab === 'friends' ? 'translate-x-full left-0' : 'left-1'}`}
          />
          <button
            onClick={() => {
              setActiveTab('confessions');
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`relative z-10 flex-1 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-colors duration-300 ${activeTab === 'confessions' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            POSTS
          </button>
          <button
            onClick={() => {
              setActiveTab('friends');
              setSelectedCategory('Bookies');
              setPage(1);
            }}
            className={`relative z-10 flex-1 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-colors duration-300 ${activeTab === 'friends' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            BOOKIES
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Filters (Sticky) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="glass-panel rounded-3xl p-1 transition-all duration-300">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between p-5 text-white bg-transparent hover:bg-white/5 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Filter className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Filters</h3>
                    <p className="text-xs text-gray-400">{categories.find(c => c.value === selectedCategory)?.label}</p>
                  </div>
                </div>
                {isFilterOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {isFilterOpen && (
                <div className="px-3 pb-3 space-y-1 animate-fade-in-down">
                  <div className="h-px bg-white/10 mx-2 mb-3" />
                  {activeTab === 'confessions' && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      All Posts
                    </button>
                  )}
                  {categories
                    .filter(c => {
                      if (activeTab === 'confessions') {
                        return c.value !== 'all' && c.value !== 'Bookies';
                      } else {
                        return c.value === 'Bookies';
                      }
                    })
                    .map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setSelectedCategory(cat.value);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Feed Column */}
        <div className="lg:col-span-6">



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
              <h3 className="text-2xl font-bold text-white mb-2">No posts found</h3>
              <p className="text-gray-400">Be the first to share something here.</p>
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
