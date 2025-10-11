import { getToken } from '../state/authState.js';

const API_BASE_URL = '/api/blog';

const handleResponse = async (response) => {
    if (response.status === 204) {
        return;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

const authorizedFetch = async (url, options = {}) => {
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
};

export const BlogService = {
    getPublicPosts: () => {
        return authorizedFetch(API_BASE_URL);
    },
    getPublicPost: (username, slug) => {
        return authorizedFetch(`${API_BASE_URL}/${username}/${slug}`);
    },
    createPost: (postData) => {
        return authorizedFetch(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    },
};

