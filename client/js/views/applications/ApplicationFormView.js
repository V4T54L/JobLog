import { ApplicationService } from '../../services/applicationService.js';
import { navigate } from '../../router.js';

export const ApplicationFormView = {
    render: async (container, params) => {
        const isEditing = !!params.id;
        let app = { CompanyName: '', RoleTitle: '', Status: 'Applied', DateApplied: new Date().toISOString().split('T')[0] };

        if (isEditing) {
            try {
                const existingApp = await ApplicationService.getApplication(params.id);
                // TODO: The service returns IDs, not names. This is a placeholder.
                // For a real implementation, the API should return joined data or we need separate lookups.
                app.CompanyName = `CompanyID ${existingApp.CompanyID}`;
                app.RoleTitle = `RoleID ${existingApp.RoleID}`;
                app.Status = existingApp.Status;
                app.DateApplied = new Date(existingApp.DateApplied).toISOString().split('T')[0];
            } catch (error) {
                container.innerHTML = `<p>Could not load application to edit.</p>`;
                return;
            }
        }

        container.innerHTML = `
            <h1 class="text-3xl font-bold mb-6">${isEditing ? 'Edit' : 'Add New'} Application</h1>
            <form id="app-form" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <div id="form-error" class="hidden text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded"></div>
                <div>
                    <label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                    <input type="text" id="companyName" name="companyName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" value="${app.CompanyName}">
                </div>
                <div>
                    <label for="roleTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Title</label>
                    <input type="text" id="roleTitle" name="roleTitle" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" value="${app.RoleTitle}">
                </div>
                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <input type="text" id="status" name="status" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" value="${app.Status}">
                </div>
                <div>
                    <label for="dateApplied" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Applied</label>
                    <input type="date" id="dateApplied" name="dateApplied" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" value="${app.DateApplied}">
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        ${isEditing ? 'Save Changes' : 'Create Application'}
                    </button>
                </div>
            </form>
        `;

        const form = container.querySelector('#app-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const errorDiv = container.querySelector('#form-error');
            errorDiv.classList.add('hidden');

            try {
                if (isEditing) {
                    await ApplicationService.updateApplication(params.id, data);
                    navigate(`/applications/${params.id}`);
                } else {
                    const newApp = await ApplicationService.createApplication(data);
                    navigate(`/applications/${newApp.ID}`);
                }
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
};
```
