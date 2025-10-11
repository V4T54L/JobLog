import { authorizedFetch, handleResponse } from './applicationService.js';

const API_BASE_URL = '/api';

export const BlogService = {
    getPublicPosts: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/blog?${query}`);
        return handleResponse(response);
    },

    getPublicPost: async (username, slug) => {
        const response = await fetch(`${API_BASE_URL}/blog/${username}/${slug}`);
        return handleResponse(response);
    },

    createPost: async (postData) => {
        return authorizedFetch(`${API_BASE_URL}/blog`, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    },

    getComments: async (postId) => {
        const response = await fetch(`${API_BASE_URL}/blog/${postId}/comments`);
        return handleResponse(response);
    },

    addComment: async (postId, commentData) => {
        return authorizedFetch(`${API_BASE_URL}/blog/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData),
        });
    },

    toggleLike: async (likeData) => {
        return authorizedFetch(`${API_BASE_URL}/blog/toggle-like`, {
            method: 'POST',
            body: JSON.stringify(likeData),
        });
    },
};

