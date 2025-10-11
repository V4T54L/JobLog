import { ApplicationService } from '../../services/applicationService.js';
import { ApplicationCard } from '../../components/ApplicationCard.js';
import { navigate } from '../../router.js';

export const ApplicationListView = {
    render: async (container) => {
        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold">My Applications</h1>
                <a href="/applications/new" data-link class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add New Application
                </a>
            </div>
            <div id="application-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <p>Loading applications...</p>
            </div>
        `;

        try {
            const applications = await ApplicationService.getApplications();
            const appListContainer = container.querySelector('#application-list');
            if (applications && applications.length > 0) {
                appListContainer.innerHTML = '';
                applications.forEach(app => {
                    appListContainer.appendChild(ApplicationCard(app));
                });
            } else {
                appListContainer.innerHTML = '<p>No applications found. Add one to get started!</p>';
            }
        } catch (error) {
            console.error('Failed to load applications:', error);
            navigate('/login');
        }
    }
};

