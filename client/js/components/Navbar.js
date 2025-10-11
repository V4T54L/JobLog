import { getTheme, toggleTheme } from '../state/themeState.js';

export const Navbar = () => {
    const nav = document.createElement('nav');
    nav.className = 'bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center sticky top-0';

    const render = () => {
        const theme = getTheme();
        nav.innerHTML = `
            <div class="flex items-center space-x-8">
                <a href="/" data-link class="text-xl font-bold text-gray-800 dark:text-white">JobTracker</a>
                <a href="/dashboard" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Dashboard</a>
            </div>
            <div class="flex items-center space-x-4">
                <button id="theme-switcher" class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span class="theme-icon text-2xl">${theme === 'dark' ? '☀️' : '🌙'}</span>
                </button>
                <!-- User menu placeholder -->
            </div>
        `;

        nav.querySelector('#theme-switcher').addEventListener('click', () => {
            toggleTheme();
            render(); // Re-render the navbar to update the icon
        });
    };

    render();
    return nav;
};

