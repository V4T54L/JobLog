import { authorizedFetch, handleResponse } from './utils.js';

const API_BASE_URL = '/api/users';

export const UserService = {
    getProfile: async (username) => {
        // Use authorizedFetch to send token if available, but it's not strictly required by the backend
        const response = await authorizedFetch(`${API_BASE_URL}/${username}/profile`);
        return handleResponse(response);
    },

    follow: async (username) => {
        const response = await authorizedFetch(`${API_BASE_URL}/${username}/follow`, {
            method: 'POST',
        });
        return handleResponse(response);
    },

    unfollow: async (username) => {
        const response = await authorizedFetch(`${API_BASE_URL}/${username}/follow`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};

