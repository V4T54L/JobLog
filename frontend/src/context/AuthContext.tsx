import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthAction, User } from '../types';

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing session
    const token = sessionStorage.getItem('joblog_token');
    const userData = sessionStorage.getItem('joblog_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } catch (error) {
        sessionStorage.removeItem('joblog_token');
        sessionStorage.removeItem('joblog_user');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (username === 'demo' && password === 'password') {
        const user: User = {
          name: 'Demo User',
          email: 'demo@joblog.com',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face'
        };
        const token = 'mock-jwt-token-' + Date.now();
        
        sessionStorage.setItem('joblog_token', token);
        sessionStorage.setItem('joblog_user', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      // Validate inputs
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        name: username,
        email: email,
        avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?w=100&h=100&fit=crop&crop=face'
      };
      const token = 'mock-jwt-token-' + Date.now();
      
      sessionStorage.setItem('joblog_token', token);
      sessionStorage.setItem('joblog_user', JSON.stringify(user));
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token }
      });
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  const logout = () => {
    sessionStorage.removeItem('joblog_token');
    sessionStorage.removeItem('joblog_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}