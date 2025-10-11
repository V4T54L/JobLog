import { HomeView } from './views/HomeView.js';
import { DashboardView } from './views/DashboardView.js';
import { LoginView } from './views/auth/LoginView.js';
import { RegisterView } from './views/auth/RegisterView.js';

let mainContentContainer;

const routes = {
    '/': HomeView,
    '/dashboard': DashboardView,
    '/login': LoginView,
    '/register': RegisterView,
};

const navigate = (path) => {
    window.history.pushState({}, path, window.location.origin + path);
    handleRoute();
};

const handleRoute = () => {
    const path = window.location.pathname;
    const view = routes[path] || { render: (container) => container.innerHTML = '<h1>404 Not Found</h1>' };
    if (mainContentContainer) {
        view.render(mainContentContainer);
    }
};

const initializeRouter = (container) => {
    mainContentContainer = container;
    window.addEventListener('popstate', handleRoute);
    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigate(e.target.getAttribute('href'));
        }
    });
};

export { initializeRouter, handleRoute, navigate };

