import { User, LoginCredentials, RegisterCredentials, ApiResponse } from '../types';

export async function loginApi(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.username === 'demo' && credentials.password === 'password') {
        resolve({
          data: {
            user: {
              name: 'Demo User',
              email: 'demo@joblog.com',
              avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face'
            },
            token: 'mock-jwt-token-' + Date.now()
          },
          message: 'Login successful'
        });
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 800);
  });
}

export async function registerApi(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.password !== credentials.confirmPassword) {
        reject(new Error('Passwords do not match'));
        return;
      }
      
      if (credentials.password.length < 6) {
        reject(new Error('Password must be at least 6 characters'));
        return;
      }

      resolve({
        data: {
          user: {
            name: credentials.username,
            email: credentials.email,
            avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?w=100&h=100&fit=crop&crop=face'
          },
          token: 'mock-jwt-token-' + Date.now()
        },
        message: 'Registration successful'
      });
    }, 1000);
  });
}