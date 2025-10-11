import { initializeRouter, handleRoute } from './router.js';
import { initializeTheme } from './state/themeState.js';
import { Navbar } from './components/Navbar.js';

const appContainer = document.getElementById('app');

function renderLayout() {
    appContainer.innerHTML = ''; // Clear previous content
    const navbar = Navbar();
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'flex-grow container mx-auto p-4';

    appContainer.appendChild(navbar);
    appContainer.appendChild(mainContent);
    return mainContent;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    const mainContentContainer = renderLayout();
    initializeRouter(mainContentContainer);
    handleRoute();
});
