import { HomeView } from './views/HomeView.js';
import { DashboardView } from './views/DashboardView.js';

let mainContentContainer;

const routes = {
    '/': HomeView,
    '/dashboard': DashboardView,
};

const navigate = (path) => {
    window.history.pushState({}, '', path);
    handleRoute();
};

export const handleRoute = () => {
    const path = window.location.pathname;
    const view = routes[path] || { render: (container) => container.innerHTML = '<h1>404 - Not Found</h1>' };
    if (mainContentContainer) {
        view.render(mainContentContainer);
    }
};

export const initializeRouter = (container) => {
    mainContentContainer = container;
    window.addEventListener('popstate', handleRoute);

    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigate(e.target.getAttribute('href'));
        }
    });
};

