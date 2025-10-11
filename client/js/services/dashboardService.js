import { authorizedFetch } from '../utils/api.js';

const API_BASE_URL = '/api/dashboard';

export const DashboardService = {
    getAnalytics: () => {
        try {
            return authorizedFetch(`${API_BASE_URL}/analytics`);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            throw error;
        }
    },
};

