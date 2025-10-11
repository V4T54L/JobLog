import { AuthService } from '../../services/authService.js';
import { setToken } from '../../state/authState.js';
import { navigate } from '../../router.js';
import { Alert } from '../../components/Alert.js';

export const LoginView = {
    render: (container) => {
        container.innerHTML = `
            <div class="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Login</h2>
                <form id="login-form">
                    <div id="error-container" class="mb-4"></div>
                    <div class="mb-4">
                        <label for="email" class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" name="email" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="password" name="password" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">Login</button>
                </form>
                <p class="mt-4 text-center text-sm">
                    Don't have an account? <a href="/register" data-link class="text-blue-500 hover:underline">Register here</a>.
                </p>
            </div>
        `;

        const form = container.querySelector('#login-form');
        const errorContainer = container.querySelector('#error-container');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorContainer.innerHTML = ''; // Clear previous errors

            const email = form.email.value;
            const password = form.password.value;

            try {
                const { token, user } = await AuthService.login(email, password);
                setToken(token, user);
                navigate('/dashboard');
            } catch (error) {
                errorContainer.appendChild(Alert(error.message || 'An unknown error occurred.'));
            }
        });
    }
};

