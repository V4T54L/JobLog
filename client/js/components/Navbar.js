import { getTheme, toggleTheme } from '../state/themeState.js';
import { isLoggedIn, logout, subscribe } from '../state/authState.js';
import { navigate } from '../router.js';

export const Navbar = () => {
    const nav = document.createElement('nav');
    nav.className = 'bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center';

    const render = () => {
        const currentTheme = getTheme();
        const loggedIn = isLoggedIn();

        nav.innerHTML = `
            <a href="/" data-link class="text-xl font-bold text-gray-800 dark:text-white">Job Tracker</a>
            <div class="flex items-center space-x-4">
                ${loggedIn ? `
                    <a href="/dashboard" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Dashboard</a>
                    <a href="/applications" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Applications</a>
                    <a href="/blog" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Blog</a>
                    <button id="logout-btn" class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Logout</button>
                ` : `
                    <a href="/login" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Login</a>
                    <a href="/register" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Register</a>
                `}
                <button id="theme-switcher" class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span class="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                </button>
            </div>
        `;

        nav.querySelector('#theme-switcher').addEventListener('click', () => {
            toggleTheme();
            render(); // Re-render to update icon
        });

        if (loggedIn) {
            nav.querySelector('#logout-btn').addEventListener('click', () => {
                logout();
                navigate('/login');
            });
        }
    };

    subscribe(render); // Re-render when auth state changes
    render(); // Initial render
    return nav;
};
