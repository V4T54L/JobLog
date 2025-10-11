import { initializeRouter, navigate } from './router.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { initializeTheme } from './state/themeState.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();

    const appContainer = document.getElementById('app');

    const renderLayout = () => {
        appContainer.innerHTML = ''; // Clear previous layout
        appContainer.appendChild(Navbar());

        const mainContent = document.createElement('main');
        mainContent.id = 'main-content';
        mainContent.className = 'flex-grow container mx-auto p-4';
        appContainer.appendChild(mainContent);

        appContainer.appendChild(Footer());

        initializeRouter(mainContent);
    };

    renderLayout();
});

