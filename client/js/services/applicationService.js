import { authorizedFetch } from '../utils/api.js';

const API_BASE_URL = '/api';

export const ApplicationService = {
    getApplications: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return authorizedFetch(`${API_BASE_URL}/applications?${query}`);
    },

    getApplication: (id) => {
        return authorizedFetch(`${API_BASE_URL}/applications/${id}`);
    },

    createApplication: (appData) => {
        return authorizedFetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            body: JSON.stringify(appData),
        });
    },

    updateApplication: (id, appData) => {
        return authorizedFetch(`${API_BASE_URL}/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(appData),
        });
    },

    deleteApplication: (id) => {
        return authorizedFetch(`${API_BASE_URL}/applications/${id}`, {
            method: 'DELETE',
        });
    },
};

