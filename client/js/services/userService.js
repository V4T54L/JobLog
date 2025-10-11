import { authorizedFetch, handleResponse } from './applicationService.js';

const API_BASE_URL = '/api/users';

export const UserService = {
    getProfile: async (username) => {
        // Profile can be public, but we send token if available to get `isFollowing` status
        return authorizedFetch(`${API_BASE_URL}/${username}/profile`);
    },

    follow: async (username) => {
        return authorizedFetch(`${API_BASE_URL}/${username}/follow`, {
            method: 'POST',
        });
    },

    unfollow: async (username) => {
        return authorizedFetch(`${API_BASE_URL}/${username}/follow`, {
            method: 'DELETE',
        });
    },
};

