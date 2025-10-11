let token = localStorage.getItem('jwt_token');
let user = null; // In a real app, you might fetch user details and store them here

const subscribers = new Set();

const notify = () => {
    subscribers.forEach(callback => callback());
};

export const setToken = (newToken) => {
    token = newToken;
    if (newToken) {
        localStorage.setItem('jwt_token', newToken);
    } else {
        localStorage.removeItem('jwt_token');
    }
    notify();
};

export const getToken = () => {
    return token;
};

export const isLoggedIn = () => {
    return !!token;
};

export const logout = () => {
    setToken(null);
};

export const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback); // Unsubscribe function
};

