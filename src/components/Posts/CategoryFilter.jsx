import React from 'react';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'academics', name: 'Academics', icon: '📚' },
    { id: 'events', name: 'Events', icon: '🎉' },
    { id: 'rants', name: 'Rants', icon: '😤' },
    { id: 'internships', name: 'Internships', icon: '💼' },
    { id: 'lost-found', name: 'Lost & Found', icon: '🔍' },
    { id: 'clubs', name: 'Clubs', icon: '🏛️' },
    { id: 'general', name: 'General', icon: '💬' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-[#17d059] text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;