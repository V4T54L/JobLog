import { AuthService } from '../../services/authService.js';
import { navigate } from '../../router.js';
import { Alert } from '../../components/Alert.js';

export const RegisterView = {
    render: (container) => {
        container.innerHTML = `
            <div class="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Register</h2>
                <form id="register-form">
                    <div id="error-container" class="mb-4"></div>
                    <div class="mb-4">
                        <label for="username" class="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
                        <input type="text" id="username" name="username" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" name="email" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="password" name="password" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">Register</button>
                </form>
                <p class="mt-4 text-center text-sm">
                    Already have an account? <a href="/login" data-link class="text-blue-500 hover:underline">Login here</a>.
                </p>
            </div>
        `;

        const form = container.querySelector('#register-form');
        const errorContainer = container.querySelector('#error-container');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorContainer.innerHTML = '';

            const username = form.username.value;
            const email = form.email.value;
            const password = form.password.value;

            try {
                await AuthService.register(username, email, password);
                navigate('/login');
            } catch (error) {
                errorContainer.appendChild(Alert(error.message || 'Registration failed.'));
            }
        });
    }
};

