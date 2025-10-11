import { AuthService } from '../../services/authService.js';
import { setToken } from '../../state/authState.js';
import { navigate } from '../../router.js';

export const LoginView = {
    render: (container) => {
        container.innerHTML = `
            <div class="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
                <form id="login-form">
                    <div id="error-message" class="hidden text-red-500 mb-4 p-2 bg-red-100 dark:bg-red-900 rounded"></div>
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="email" name="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" id="password" name="password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Login
                    </button>
                </form>
                <p class="mt-4 text-center text-sm">
                    Don't have an account? <a href="/register" data-link class="text-blue-500 hover:underline">Register here</a>.
                </p>
            </div>
        `;

        const form = container.querySelector('#login-form');
        const errorMessage = container.querySelector('#error-message');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.classList.add('hidden');
            const email = form.email.value;
            const password = form.password.value;

            try {
                const data = await AuthService.login(email, password);
                setToken(data.token);
                navigate('/dashboard');
            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            }
        });
    }
};

