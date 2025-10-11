import * as authState from '../state/authState.js';
import { getTheme, toggleTheme } from '../state/themeState.js';
import { navigate } from '../router.js';

export const Navbar = () => {
    const nav = document.createElement('nav');
    nav.className = 'bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center sticky top-0 z-50';

    const render = () => {
        const isLoggedIn = authState.isLoggedIn();
        const user = authState.getUser();
        const currentTheme = getTheme();

        nav.innerHTML = `
            <div class="flex items-center">
                <a href="/" data-link class="text-xl font-bold text-gray-800 dark:text-white">Job Tracker</a>
            </div>
            
            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-4">
                <a href="/dashboard" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Dashboard</a>
                <a href="/applications" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Applications</a>
                <a href="/blog" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Blog</a>
                ${isLoggedIn ? `
                    <a href="/profile/${user.username}" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Profile</a>
                    <button id="logout-btn" class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Logout</button>
                ` : `
                    <a href="/login" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Login</a>
                    <a href="/register" data-link class="text-gray-600 dark:text-gray-300 hover:text-blue-500">Register</a>
                `}
                <button id="theme-switcher" class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span class="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                </button>
            </div>

            <!-- Mobile Menu Button -->
            <div class="md:hidden flex items-center">
                 <button id="theme-switcher-mobile" class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2">
                    <span class="theme-icon-mobile">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                </button>
                <button id="mobile-menu-button" class="text-gray-600 dark:text-gray-300 focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        `;

        // Mobile Menu (initially hidden)
        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobile-menu';
        mobileMenu.className = 'hidden md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-md';
        mobileMenu.innerHTML = `
            <div class="flex flex-col p-4 space-y-2">
                <a href="/dashboard" data-link class="block text-gray-600 dark:text-gray-300 hover:text-blue-500">Dashboard</a>
                <a href="/applications" data-link class="block text-gray-600 dark:text-gray-300 hover:text-blue-500">Applications</a>
                <a href="/blog" data-link class="block text-gray-600 dark:text-gray-300 hover:text-blue-500">Blog</a>
                ${isLoggedIn ? `
                    <a href="/profile/${user.username}" data-link class="block text-gray-600 dark:text-gray-300 hover:text-blue-500">Profile</a>
                    <button id="logout-btn-mobile" class="text-left text-gray-600 dark:text-gray-300 hover:text-blue-500">Logout</button>
                ` : `
                    <a href="/login" data-link class="block text-gray-600 dark:text-gray-300 hover:text-blue-500">Login</a>
                    <a href="/register" data-link class="block text-gray-600 dark:text-gray-300 hover:text-blue-500">Register</a>
                `}
            </div>
        `;
        nav.appendChild(mobileMenu);

        // Event Listeners
        const themeSwitcher = nav.querySelector('#theme-switcher');
        if (themeSwitcher) themeSwitcher.addEventListener('click', handleThemeToggle);
        
        const themeSwitcherMobile = nav.querySelector('#theme-switcher-mobile');
        if (themeSwitcherMobile) themeSwitcherMobile.addEventListener('click', handleThemeToggle);

        const logoutBtn = nav.querySelector('#logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        
        const logoutBtnMobile = nav.querySelector('#logout-btn-mobile');
        if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

        const mobileMenuButton = nav.querySelector('#mobile-menu-button');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    };

    const handleThemeToggle = () => {
        toggleTheme();
        render(); // Re-render to update icon
    };

    const handleLogout = () => {
        authState.logout();
        navigate('/login');
    };

    authState.subscribe(render);
    render();

    return nav;
};

