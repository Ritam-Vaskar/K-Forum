import axios from 'axios';
import { mockApi } from './mockApi';
import toast from 'react-hot-toast';

let isOfflineNotified = false;

// Request Interceptor
axios.interceptors.request.use(
    (config) => {
        // Ensure we use the correct port or env var if not in offline mode
        const baseUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5001';
        if (config.url && !config.url.startsWith('http')) {
            config.url = `${baseUrl}${config.url}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Check for Network Error, connection refused, OR Server Errors (5xx)
        const isNetworkError = error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
        const isServerError = error.response && error.response.status >= 500;

        if (isNetworkError || isServerError) {

            if (!isOfflineNotified) {
                console.warn('⚠️ Backend unreachable or erroring. Switching to Offline Mock Mode.');
                toast('Backend issue. Switching to Offline Mode.', { icon: '📡' });
                isOfflineNotified = true;
            }

            const { config } = error;

            // Route to Mock API based on URL
            try {
                // --- AUTH --- //
                if (config.url.includes('/auth/login')) {
                    const data = JSON.parse(config.data);
                    const result = await mockApi.login(data);
                    return { data: result, status: 200 };
                }

                if (config.url.includes('/auth/register')) {
                    const data = JSON.parse(config.data);
                    const result = await mockApi.register(data);
                    return { data: result, status: 200 };
                }

                if (config.url.includes('/auth/verify-otp')) {
                    const data = JSON.parse(config.data);
                    const result = await mockApi.verifyOtp(data);
                    return { data: result, status: 200 };
                }

                // --- POSTS --- //
                if (config.url.includes('/posts') && config.method === 'get') {
                    const result = await mockApi.getPosts();
                    return { data: result, status: 200 };
                }

                if (config.url.includes('/posts') && config.method === 'post') {
                    // Handle FormData for post creation
                    let postData = {};
                    if (config.data instanceof FormData) {
                        // Extract data from FormData
                        postData = {
                            title: config.data.get('title') || 'Untitled Post',
                            content: config.data.get('content') || '',
                            category: config.data.get('category') || 'general',
                            tags: config.data.get('tags') || '',
                            isAnonymous: config.data.get('isAnonymous') === 'true'
                        };
                    } else if (typeof config.data === 'string') {
                        try {
                            postData = JSON.parse(config.data);
                        } catch (e) {
                            postData = {};
                        }
                    }
                    const result = await mockApi.createPost(postData);
                    return { data: result, status: 200 };
                }

            } catch (mockError) {
                // If mock API throws, return it as a proper axios error response
                return Promise.reject(mockError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;
