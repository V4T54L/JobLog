import { ApplicationService } from '../../services/applicationService.js';
import { navigate } from '../../router.js';

export const ApplicationDetailView = {
    render: async (container, params) => {
        container.innerHTML = `<p>Loading application details...</p>`;

        try {
            const app = await ApplicationService.getApplication(params.id);
            if (!app) {
                container.innerHTML = `<p>Application not found.</p>`;
                return;
            }

            const date = new Date(app.DateApplied).toLocaleDateString();

            container.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h1 class="text-3xl font-bold">${app.RoleID}</h1>
                            <p class="text-xl text-gray-600 dark:text-gray-400">${app.CompanyID}</p>
                        </div>
                        <a href="/applications/${app.ID}/edit" data-link class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">Edit</a>
                    </div>
                    <div class="space-y-2">
                        <p><strong>Status:</strong> ${app.Status}</p>
                        <p><strong>Date Applied:</strong> ${date}</p>
                    </div>
                    <hr class="my-6 border-gray-200 dark:border-gray-700">
                    <h2 class="text-2xl font-bold mb-4">Notes</h2>
                    <div id="notes-list">
                        <!-- Notes will be rendered here -->
                        <p class="text-gray-500">Notes functionality coming soon.</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load application details:', error);
            container.innerHTML = `<p>Error loading application. You may not have permission to view this.</p>`;
        }
    }
};

