import { authorizedFetch } from '../utils/api.js';

const API_BASE_URL = '/api/users';

export const UserService = {
    getProfile: (username) => {
        return authorizedFetch(`${API_BASE_URL}/${username}/profile`);
    },

    follow: (username) => {
        return authorizedFetch(`${API_BASE_URL}/${username}/follow`, {
            method: 'POST',
        });
    },

    unfollow: (username) => {
        return authorizedFetch(`${API_BASE_URL}/${username}/follow`, {
            method: 'DELETE',
        });
    },
};

