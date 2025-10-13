
import axios from 'axios';
import { getToken, removeToken } from './tokenService';

// Create a central Axios instance with a base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// |--- Request Interceptor ---
// Automatically adds the JWT to the Authorization header for every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// |--- Response Interceptor ---
// Checks for 401 Unauthorized errors to automatically log the user out.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access - logging out.");
      removeToken(); // Clear the expired/invalid token
      // Redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
