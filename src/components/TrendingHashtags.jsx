import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Hash } from 'lucide-react';

const TrendingHashtags = ({ onTagClick }) => {
    const [trendingTags, setTrendingTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingTags();
    }, []);

    const fetchTrendingTags = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_API || 'http://localhost:5001'}/api/posts/trending/hashtags`,
                { params: { limit: 10 } }
            );
            setTrendingTags(response.data || []);
        } catch (error) {
            console.error('Error fetching trending tags:', error);
            // Fallback mock data for offline mode
            setTrendingTags([
                { tag: 'kiit', count: 42 },
                { tag: 'placements', count: 38 },
                { tag: 'exams', count: 25 },
                { tag: 'campus', count: 18 },
                { tag: 'coding', count: 15 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#17d059]" />
                    <h3 className="text-white font-semibold">Trending</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (trendingTags.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#17d059]" />
                <h3 className="text-white font-semibold">Trending Now</h3>
            </div>
            <div className="space-y-2">
                {trendingTags.map((item, index) => (
                    <button
                        key={item.tag}
                        onClick={() => onTagClick && onTagClick(item.tag)}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500 text-sm w-4">{index + 1}</span>
                                <Hash className="w-4 h-4 text-[#17d059]" />
                                <span className="text-white group-hover:text-[#17d059] transition-colors">
                                    {item.tag}
                                </span>
                            </div>
                            <span className="text-gray-500 text-sm">{item.count} posts</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TrendingHashtags;
