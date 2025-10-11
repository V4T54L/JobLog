import { HomeView } from './views/HomeView.js';
import { DashboardView } from './views/DashboardView.js';
import { LoginView } from './views/auth/LoginView.js';
import { RegisterView } from './views/auth/RegisterView.js';
import { ApplicationListView } from './views/applications/ApplicationListView.js';
import { ApplicationDetailView } from './views/applications/ApplicationDetailView.js';
import { ApplicationFormView } from './views/applications/ApplicationFormView.js';

let mainContentContainer;

const routes = [
    { path: '/', view: HomeView },
    { path: '/dashboard', view: DashboardView },
    { path: '/login', view: LoginView },
    { path: '/register', view: RegisterView },
    { path: '/applications', view: ApplicationListView },
    { path: '/applications/new', view: ApplicationFormView },
    { path: '/applications/:id', view: ApplicationDetailView },
    { path: '/applications/:id/edit', view: ApplicationFormView },
];

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
    return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
};

export const navigate = (path) => {
    history.pushState(null, null, path);
    handleRoute();
};

export const handleRoute = async () => {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: { path: '/404', view: { render: (container) => container.innerHTML = '<h1>404 Not Found</h1>' } },
            result: [location.pathname]
        };
    }

    const params = getParams(match);
    await match.route.view.render(mainContentContainer, params);
};

export const initializeRouter = (container) => {
    mainContentContainer = container;
    window.addEventListener('popstate', handleRoute);
    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigate(e.target.href);
        }
    });
    handleRoute();
};

