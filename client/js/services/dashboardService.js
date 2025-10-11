import { authorizedFetch } from './applicationService.js';

const API_BASE_URL = '/api/dashboard';

export const DashboardService = {
    getAnalytics: async () => {
        try {
            return await authorizedFetch(`${API_BASE_URL}/analytics`, {
                method: 'GET',
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    },
};

