import { getToken } from '../state/authState.js';

const API_BASE_URL = '/api/blog';

async function handleResponse(response) {
    if (response.status === 204) {
        return null;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data;
}

async function authorizedFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    return handleResponse(response);
}

export const BlogService = {
    getPublicPosts: async () => {
        const response = await fetch(`${API_BASE_URL}/posts`);
        return handleResponse(response);
    },
    getPublicPost: async (username, slug) => {
        const response = await fetch(`${API_BASE_URL}/posts/${username}/${slug}`);
        return handleResponse(response);
    },
    createPost: async (postData) => {
        return authorizedFetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    },
    getComments: async (postId) => {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
        return handleResponse(response);
    },
    addComment: async (postId, commentData) => {
        return authorizedFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData),
        });
    },
    toggleLike: async (likeData) => {
        return authorizedFetch(`${API_BASE_URL}/like`, {
            method: 'POST',
            body: JSON.stringify(likeData),
        });
    },
};
