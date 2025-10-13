
const TOKEN_KEY = 'joblog_jwt';

/**
 * Saves the user's JWT to localStorage.
 * @param token - The JWT received from the login endpoint.
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieves the user's JWT from localStorage.
 * @returns The token, or null if it's not found.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Removes the user's JWT from localStorage (for logout).
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
