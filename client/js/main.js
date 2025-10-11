import { Navbar } from './components/Navbar.js';
import { initializeRouter, handleRoute } from './router.js';
import { initializeTheme } from './state/themeState.js';

const appContainer = document.getElementById('app');

const renderLayout = () => {
    const navbar = Navbar();
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'flex-grow container mx-auto p-4';

    appContainer.innerHTML = ''; // Clear previous content
    appContainer.appendChild(navbar);
    appContainer.appendChild(mainContent);
};

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    renderLayout();
    initializeRouter(document.getElementById('main-content'));
    handleRoute(); // Handle the initial route
});

