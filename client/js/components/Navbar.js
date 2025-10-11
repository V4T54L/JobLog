import { getTheme, toggleTheme } from '../state/themeState.js';
import { isLoggedIn, logout, subscribe, getUser } from '../state/authState.js'; // Added getUser
import { navigate } from '../router.js';

export const Navbar = () => {
    const nav = document.createElement('nav');
    // Kept original className for sticky behavior
    nav.className = 'bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center sticky top-0 z-10';

    const render = () => {
        const currentTheme = getTheme();
        const loggedIn = isLoggedIn();
        const user = getUser(); // Added from attempted

        let authLinks = `
            <a href="/login" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Login</a>
            <a href="/register" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Register</a>
        `;

        if (loggedIn && user) {
            authLinks = `
                <a href="/profile/${user.username}" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Profile</a>
                <button id="logout-btn" class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Logout</button>
            `;
        }

        nav.innerHTML = `
            <a href="/" data-link class="text-xl font-bold text-gray-800 dark:text-white">Job Tracker</a>
            <div class="flex items-center space-x-4">
                <a href="/dashboard" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Dashboard</a>
                <a href="/applications" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Applications</a>
                <a href="/blog" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Blog</a>
                ${authLinks}
                <button id="theme-switcher" class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span class="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                </button>
            </div>
        `;

        nav.querySelector('#theme-switcher').addEventListener('click', () => {
            const newTheme = toggleTheme();
            nav.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });

        if (loggedIn) {
            // Used optional chaining for logout-btn as it might not exist if not logged in
            nav.querySelector('#logout-btn')?.addEventListener('click', () => {
                logout();
                navigate('/login');
            });
        }
    };

    subscribe(render); // Re-render when auth state changes
    render(); // Initial render

    return nav;
};

