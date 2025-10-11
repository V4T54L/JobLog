export const DashboardView = {
    render: (container) => {
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
                <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p>Analytics and charts will be displayed here.</p>
                </div>
            </div>
        `;
    }
};
```
