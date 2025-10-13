
import apiClient from './apiClient';
import { setToken, removeToken } from './tokenService';
import type { User, UserRegistration, UserLogin, AuthResponse } from './types';

/**
 * Registers a new user.
 */
export const register = async (registrationData: UserRegistration): Promise<User> => {
  const response = await apiClient.post<User>('/auth/register', registrationData);
  return response.data;
};

/**
 * Logs in a user and stores the received token.
 */
export const login = async (credentials: UserLogin): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  if (response.data?.token) {
    setToken(response.data.token);
  }
  return response.data;
};

/**
 * Logs out the user by removing the token.
 */
export const logout = (): void => {
  removeToken();
};

/**
 * Fetches the profile of the currently logged-in user.
 */
export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
