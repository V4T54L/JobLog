import { ApplicationService } from '../../services/applicationService.js';
import { ApplicationCard } from '../../components/ApplicationCard.js';
import { navigate } from '../../router.js';

export const ApplicationListView = {
    render: async (container) => {
        let state = {
            page: 1,
            limit: 10,
            search: '',
            status: '',
            sortBy: 'date_applied',
            sortOrder: 'desc',
        };

        const updateView = async () => {
            container.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-bold">My Job Applications</h1>
                    <a href="/applications/new" data-link class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add New Application</a>
                </div>

                <!-- Filters and Search -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 flex flex-wrap gap-4 items-center">
                    <div class="flex-grow">
                        <label for="search" class="sr-only">Search</label>
                        <input type="text" id="search" placeholder="Search by company or role..." value="${state.search}" class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    </div>
                    <div>
                        <label for="status-filter" class="sr-only">Status</label>
                        <select id="status-filter" class="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">All Statuses</option>
                            <option value="Applied" ${state.status === 'Applied' ? 'selected' : ''}>Applied</option>
                            <option value="Interviewing" ${state.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
                            <option value="Offer" ${state.status === 'Offer' ? 'selected' : ''}>Offer</option>
                            <option value="Rejected" ${state.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                     <div>
                        <label for="sort-by" class="sr-only">Sort By</label>
                        <select id="sort-by" class="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <option value="date_applied" ${state.sortBy === 'date_applied' ? 'selected' : ''}>Date Applied</option>
                            <option value="company" ${state.sortBy === 'company' ? 'selected' : ''}>Company</option>
                            <option value="role" ${state.sortBy === 'role' ? 'selected' : ''}>Role</option>
                            <option value="status" ${state.sortBy === 'status' ? 'selected' : ''}>Status</option>
                        </select>
                    </div>
                </div>

                <div id="application-list-container" class="space-y-4">
                    <p>Loading applications...</p>
                </div>
                <div id="pagination-container" class="mt-6 flex justify-between items-center"></div>
            `;

            const listContainer = container.querySelector('#application-list-container');
            const paginationContainer = container.querySelector('#pagination-container');

            try {
                const data = await ApplicationService.getApplications(state);
                const { applications, pagination } = data;

                if (applications && applications.length > 0) {
                    listContainer.innerHTML = '';
                    applications.forEach(app => {
                        listContainer.appendChild(ApplicationCard(app));
                    });
                } else {
                    listContainer.innerHTML = '<p>No applications found. Add one to get started!</p>';
                }

                // Render pagination
                paginationContainer.innerHTML = `
                    <div>
                        <span class="text-sm text-gray-700 dark:text-gray-400">
                            Showing page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalItems} total)
                        </span>
                    </div>
                    <div class="inline-flex mt-2 xs:mt-0">
                        <button id="prev-page" class="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                            Prev
                        </button>
                        <button id="next-page" class="px-4 py-2 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                            Next
                        </button>
                    </div>
                `;

                container.querySelector('#prev-page')?.addEventListener('click', () => {
                    if (state.page > 1) {
                        state.page--;
                        updateView();
                    }
                });
                container.querySelector('#next-page')?.addEventListener('click', () => {
                    if (state.page < pagination.totalPages) {
                        state.page++;
                        updateView();
                    }
                });

            } catch (error) {
                listContainer.innerHTML = `<p class="text-red-500">Error loading applications: ${error.message}</p>`;
                paginationContainer.innerHTML = '';
            }

            // Add event listeners after rendering controls
            container.querySelector('#search').addEventListener('change', (e) => {
                state.search = e.target.value;
                state.page = 1; // Reset to first page on new search
                updateView();
            });
            container.querySelector('#status-filter').addEventListener('change', (e) => {
                state.status = e.target.value;
                state.page = 1;
                updateView();
            });
            container.querySelector('#sort-by').addEventListener('change', (e) => {
                state.sortBy = e.target.value;
                state.page = 1;
                updateView();
            });
        };

        await updateView();
    }
};

