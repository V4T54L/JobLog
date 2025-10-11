import { getToken } from '../state/authState.js';

export const handleResponse = async (response) => {
    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'An API error occurred');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const authorizedFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return handleResponse(response);
};

