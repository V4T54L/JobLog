import { DashboardService } from '../services/dashboardService.js';

const renderStatusChart = (canvas, data) => {
    const ctx = canvas.getContext('2d');
    const labels = data.map(d => d.status);
    const counts = data.map(d => d.count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Applications',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
        }
    });
};

const renderTimelineChart = (canvas, data) => {
    const ctx = canvas.getContext('2d');
    const labels = data.map(d => d.date);
    const counts = data.map(d => d.count);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Applications per Month',
                data: counts,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
        }
    });
};


export const DashboardView = {
    render: async (container) => {
        container.innerHTML = `
            <div class="p-4 md:p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Dashboard</h1>
                <div id="dashboard-content" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <p class="text-gray-600 dark:text-gray-400">Loading analytics...</p>
                </div>
            </div>
        `;

        try {
            const analytics = await DashboardService.getAnalytics();
            const dashboardContent = document.getElementById('dashboard-content');

            if (!analytics || (!analytics.applicationsByStatus?.length && !analytics.applicationsOverTime?.length)) {
                dashboardContent.innerHTML = `<p class="text-gray-600 dark:text-gray-400 col-span-full">No application data yet. Add some applications to see your analytics!</p>`;
                return;
            }

            dashboardContent.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Applications by Status</h2>
                    <div class="chart-container" style="position: relative; height:40vh;">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Application Timeline</h2>
                     <div class="chart-container" style="position: relative; height:40vh;">
                        <canvas id="timelineChart"></canvas>
                    </div>
                </div>
            `;

            if (analytics.applicationsByStatus && analytics.applicationsByStatus.length > 0) {
                const statusCanvas = document.getElementById('statusChart');
                renderStatusChart(statusCanvas, analytics.applicationsByStatus);
            } else {
                 document.getElementById('statusChart').parentElement.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">No status data available.</p>`;
            }

            if (analytics.applicationsOverTime && analytics.applicationsOverTime.length > 0) {
                const timelineCanvas = document.getElementById('timelineChart');
                renderTimelineChart(timelineCanvas, analytics.applicationsOverTime);
            } else {
                document.getElementById('timelineChart').parentElement.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">No timeline data available.</p>`;
            }

        } catch (error) {
            document.getElementById('dashboard-content').innerHTML = `<p class="text-red-500 col-span-full">Error loading dashboard: ${error.message}</p>`;
        }
    }
};
