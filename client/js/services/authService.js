import { authorizedFetch } from '../utils/api.js';

const API_BASE_URL = '/api';

export const AuthService = {
    login: (email, password) => {
        return authorizedFetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    register: (username, email, password) => {
        return authorizedFetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    },
};

