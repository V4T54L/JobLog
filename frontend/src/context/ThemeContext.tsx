import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ThemeState, ThemeAction } from '../types';

interface ThemeContextType {
  state: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const initialState: ThemeState = {
  isDark: false,
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        isDark: !state.isDark,
      };
    case 'SET_THEME':
      return {
        ...state,
        isDark: action.payload,
      };
    default:
      return state;
  }
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('joblog_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    dispatch({ type: 'SET_THEME', payload: isDark });
  }, []);

  useEffect(() => {
    // Update HTML class and save preference
    if (state.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('joblog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('joblog_theme', 'light');
    }
  }, [state.isDark]);

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <ThemeContext.Provider value={{ state, dispatch, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}