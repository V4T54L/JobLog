import { getToken } from '../state/authState.js';

const API_BASE_URL = '/api';

export async function handleResponse(response) {
    if (response.status === 204) {
        return null;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || 'An unknown error occurred');
    }
    return data;
}

export async function authorizedFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);
    return handleResponse(response);
}


export const ApplicationService = {
    getApplications: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return authorizedFetch(`${API_BASE_URL}/applications?${query}`);
    },

    getApplication: async (id) => {
        return authorizedFetch(`${API_BASE_URL}/applications/${id}`);
    },

    createApplication: async (appData) => {
        return authorizedFetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            body: JSON.stringify(appData),
        });
    },

    updateApplication: async (id, appData) => {
        return authorizedFetch(`${API_BASE_URL}/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(appData),
        });
    },

    deleteApplication: async (id) => {
        return authorizedFetch(`${API_BASE_URL}/applications/${id}`, {
            method: 'DELETE',
        });
    },
};

