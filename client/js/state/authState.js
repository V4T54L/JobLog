let token = localStorage.getItem('jwt_token');
let user = JSON.parse(localStorage.getItem('current_user')); // Updated to store user object

const subscribers = new Set();

function notify() { // Changed to function declaration
    subscribers.forEach(callback => callback());
}

export function setToken(newToken, newUser) { // Updated signature to include newUser
    token = newToken;
    user = newUser;
    if (token && user) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('current_user', JSON.stringify(user)); // Store user object
    } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user'); // Remove user object
    }
    notify();
}

export function getToken() { // Changed to function declaration
    return token;
}

export function getUser() { // Added from attempted
    return user;
}

export function isLoggedIn() { // Changed to function declaration
    return !!token;
}

export function logout() { // Changed to function declaration
    setToken(null, null); // Updated to clear user object
}

export function subscribe(callback) { // Changed to function declaration
    subscribers.add(callback);
    // Return an unsubscribe function
    return () => subscribers.delete(callback);
}

