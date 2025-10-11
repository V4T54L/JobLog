import { HomeView } from './views/HomeView.js';
import { DashboardView } from './views/DashboardView.js';
import { LoginView } from './views/auth/LoginView.js';
import { RegisterView } from './views/auth/RegisterView.js';
import { ApplicationListView } from './views/applications/ApplicationListView.js';
import { ApplicationDetailView } from './views/applications/ApplicationDetailView.js';
import { ApplicationFormView } from './views/applications/ApplicationFormView.js';
import { BlogListView } from './views/blog/BlogListView.js';
import { BlogPostDetailView } from './views/blog/BlogPostDetailView.js';
import { BlogPostEditorView } from './views/blog/BlogPostEditorView.js';
import { ProfileView } from './views/profile/ProfileView.js'; // Added from attempted

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
    { path: "/blog", view: BlogListView },
    { path: "/blog/new", view: BlogPostEditorView },
    { path: "/blog/:username/:slug", view: BlogPostDetailView },
    { path: '/profile/:username', view: ProfileView }, // Added from attempted
];

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$"); // Adopted attempted's regex

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
        } else if (e.target.closest("[data-link]")) { // Kept original's robust click handler
            e.preventDefault();
            navigate(e.target.closest("[data-link]").href);
        }
    });
    handleRoute();
};

