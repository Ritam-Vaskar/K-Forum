import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/axiosSetup';
import toast from 'react-hot-toast';
import { Send, Tag, Eye, EyeOff, Image, X } from 'lucide-react';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isAnonymous: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { id: 'academics', name: 'Academics', icon: '📚' },
    { id: 'events', name: 'Events', icon: '🎉' },
    { id: 'rants', name: 'Rants', icon: '😤' },
    { id: 'internships', name: 'Internships', icon: '💼' },
    { id: 'lost-found', name: 'Lost & Found', icon: '🔍' },
    { id: 'clubs', name: 'Clubs', icon: '🏛️' },
    { id: 'general', name: 'General', icon: '💬' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImageFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    const newImagePreviews = newImageFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setSelectedImages([...selectedImages, ...newImagePreviews]);
    setImageFiles([...imageFiles, ...newImageFiles]);
  };

  const removeImage = (index) => {
    const newSelectedImages = [...selectedImages];
    const newImageFiles = [...imageFiles];

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(selectedImages[index].url);

    newSelectedImages.splice(index, 1);
    newImageFiles.splice(index, 1);

    setSelectedImages(newSelectedImages);
    setImageFiles(newImageFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isAnonymous', formData.isAnonymous);

      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const response = await axios.post(
        '/api/posts',
        formDataToSend
      );
      toast.success('Post created successfully!');
      navigate(`/post/${response.data._id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors from server
        const errors = error.response.data.errors;
        Object.values(errors).forEach(error => {
          toast.error(error);
        });
      } else if (error.message) {
        // Handle client-side validation errors
        toast.error(error.message);
      } else {
        toast.error('Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create New Post</h1>
              <p className="text-gray-400">Share your thoughts with the K-Forum community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength="200"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors"
                  placeholder="What's your post about?"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.category === category.id
                        ? 'border-[#17d059] bg-[#17d059]/10 text-[#17d059]'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={formData.category === category.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  maxLength="5000"
                  rows="8"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors resize-none"
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.content.length}/5000 characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (optional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-[#17d059] focus:outline-none transition-colors"
                    placeholder="programming, web development, internship (separate with commas)"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Add relevant tags to help others find your post
                </p>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  {formData.isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-white font-medium">Anonymous Post</h3>
                    <p className="text-gray-400 text-sm">
                      {formData.isAnonymous
                        ? 'Your identity will be hidden from other users'
                        : 'Your name and details will be visible to other users'
                      }
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#17d059]"></div>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Images (optional)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center justify-center px-4 py-6 bg-gray-700 text-white rounded-lg border-2 border-gray-600 border-dashed cursor-pointer hover:border-[#17d059] transition-colors">
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Click to upload images (max 5)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.title || !formData.content || !formData.category}
                  className="bg-gradient-to-r from-[#17d059] to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-[#15b84f] hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-[#17d059]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Publishing...' : 'Publish Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;