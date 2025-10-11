import { getToken, getUser } from '../state/authState.js';

const API_BASE_URL = '/api';

async function handleResponse(response) {
    if (response.status === 204) {
        return null;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
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

export const ApplicationService = {
    getApplications: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/applications?${query}`;
        return authorizedFetch(url);
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

