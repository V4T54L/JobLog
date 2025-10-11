import { getToken } from '../state/authState.js';

const API_BASE_URL = '/api';

const handleResponse = async (response) => {
    if (response.status === 204) {
        return null;
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

export const ApplicationService = {
    getApplications: () => authorizedFetch(`${API_BASE_URL}/applications`),
    getApplication: (id) => authorizedFetch(`${API_BASE_URL}/applications/${id}`),
    createApplication: (appData) => authorizedFetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        body: JSON.stringify(appData),
    }),
    updateApplication: (id, appData) => authorizedFetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appData),
    }),
    deleteApplication: (id) => authorizedFetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE',
    }),
};

