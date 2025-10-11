import { authorizedFetch } from '../utils/api.js';

const API_BASE_URL = '/api';

export const BlogService = {
    getPublicPosts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return authorizedFetch(`${API_BASE_URL}/blog/public?${query}`);
    },

    getPublicPost: (username, slug) => {
        return authorizedFetch(`${API_BASE_URL}/blog/${username}/${slug}`);
    },

    createPost: (postData) => {
        return authorizedFetch(`${API_BASE_URL}/blog`, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    },

    getComments: (postId) => {
        return authorizedFetch(`${API_BASE_URL}/blog/${postId}/comments`);
    },

    addComment: (postId, commentData) => {
        return authorizedFetch(`${API_BASE_URL}/blog/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData),
        });
    },

    toggleLike: (likeData) => {
        return authorizedFetch(`${API_BASE_URL}/blog/like`, {
            method: 'POST',
            body: JSON.stringify(likeData),
        });
    },
};

