import { ApplicationService } from '../../services/applicationService.js';
import { navigate } from '../../router.js';
import { Alert } from '../../components/Alert.js';
import { Spinner } from '../../components/Spinner.js';

export const ApplicationFormView = {
    render: async (container, params) => {
        const isEditMode = !!params.id;
        let existingApp = null;

        container.innerHTML = '';
        container.appendChild(Spinner());

        if (isEditMode) {
            try {
                existingApp = await ApplicationService.getApplication(params.id);
            } catch (error) {
                container.innerHTML = '';
                container.appendChild(Alert('Could not load application data.'));
                return;
            }
        }

        container.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">${isEditMode ? 'Edit' : 'Add New'} Application</h2>
                <form id="application-form">
                    <div id="error-container" class="mb-4"></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="companyName" class="block text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                            <input type="text" id="companyName" name="companyName" value="${existingApp?.company_name || ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                        </div>
                        <div>
                            <label for="roleTitle" class="block text-gray-700 dark:text-gray-300 mb-2">Role Title</label>
                            <input type="text" id="roleTitle" name="roleTitle" value="${existingApp?.role_title || ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                        </div>
                        <div>
                            <label for="status" class="block text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <input type="text" id="status" name="status" value="${existingApp?.status || ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                        </div>
                        <div>
                            <label for="dateApplied" class="block text-gray-700 dark:text-gray-300 mb-2">Date Applied</label>
                            <input type="date" id="dateApplied" name="dateApplied" value="${existingApp ? new Date(existingApp.date_applied).toISOString().split('T')[0] : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                        </div>
                    </div>
                    <div class="mt-6">
                        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">${isEditMode ? 'Update' : 'Save'} Application</button>
                    </div>
                </form>
            </div>
        `;

        const form = container.querySelector('#application-form');
        const errorContainer = container.querySelector('#error-container');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorContainer.innerHTML = '';

            const appData = {
                company_name: form.companyName.value,
                role_title: form.roleTitle.value,
                status: form.status.value,
                date_applied: form.dateApplied.value,
            };

            try {
                let savedApp;
                if (isEditMode) {
                    savedApp = await ApplicationService.updateApplication(params.id, appData);
                } else {
                    savedApp = await ApplicationService.createApplication(appData);
                }
                navigate(`/applications/${savedApp.id}`);
            } catch (error) {
                errorContainer.appendChild(Alert(error.message || 'Failed to save application.'));
            }
        });
    }
};
