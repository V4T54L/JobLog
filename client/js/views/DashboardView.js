import { DashboardService } from '../services/dashboardService.js';
import { Spinner } from '../components/Spinner.js';
import { Alert } from '../components/Alert.js';

let statusChartInstance = null;
let timelineChartInstance = null;

const renderStatusChart = (canvas, data) => {
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    statusChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.status),
            datasets: [{
                label: '# of Applications',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
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
    if (timelineChartInstance) {
        timelineChartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    timelineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Applications per Month',
                data: data.map(d => d.count),
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
        container.innerHTML = '';
        container.appendChild(Spinner());

        try {
            const analytics = await DashboardService.getAnalytics();
            
            container.innerHTML = `
                <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>
                ${(!analytics || !analytics.applications_by_status || analytics.applications_by_status.length === 0) ? `
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <p class="text-center text-gray-600 dark:text-gray-300">No application data yet. Add your first application to see analytics here!</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Applications by Status</h2>
                            <div class="chart-container" style="position: relative; height:40vh;">
                                <canvas id="status-chart"></canvas>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Application Timeline</h2>
                            <div class="chart-container" style="position: relative; height:40vh;">
                                <canvas id="timeline-chart"></canvas>
                            </div>
                        </div>
                    </div>
                `}
            `;

            if (analytics && analytics.applications_by_status && analytics.applications_by_status.length > 0) {
                const statusCanvas = document.getElementById('status-chart');
                renderStatusChart(statusCanvas, analytics.applications_by_status);
            }
            if (analytics && analytics.applications_over_time && analytics.applications_over_time.length > 0) {
                const timelineCanvas = document.getElementById('timeline-chart');
                renderTimelineChart(timelineCanvas, analytics.applications_over_time);
            }

        } catch (error) {
            container.innerHTML = '';
            container.appendChild(Alert('Could not load dashboard data. Please try again later.'));
        }
    }
};

