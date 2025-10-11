export const HomeView = {
    render: (container) => {
        container.innerHTML = `
            <div class="text-center py-16">
                <h1 class="text-4xl font-bold mb-4">Welcome to Job App Tracker</h1>
                <p class="text-lg text-gray-600 dark:text-gray-400">Your personal dashboard for managing job applications.</p>
            </div>
        `;
    }
};

