import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, Loader } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { state, login, register, dispatch } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Clear any existing errors when modal opens
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }, [isOpen, initialTab, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (state.error) {
      dispatch({ type: 'CLEAR_ERROR' });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      onClose();
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.username, formData.email, formData.password, formData.confirmPassword);
      onClose();
    } catch (error) {
      // Error is handled in the context
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    resetForm();
    dispatch({ type: 'CLEAR_ERROR' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Welcome to JobLog
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-[var(--muted)] rounded-lg p-1">
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{state.error}</p>
            </motion.div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === 'signin' ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="signin-username" className="label">
                    Username
                  </label>
                  <input
                    id="signin-username"
                    name="username"
                    type="text"
                    required
                    className="input"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className="label">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    className="input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={state.loading}
                  className="btn btn-primary w-full py-3 text-base"
                >
                  {state.loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
                <p className="text-xs text-[var(--muted-foreground)] text-center mt-2">
                  Demo credentials: username "demo", password "password"
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="signup-username" className="label">
                    Username
                  </label>
                  <input
                    id="signup-username"
                    name="username"
                    type="text"
                    required
                    className="input"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="label">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    className="input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="label">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    className="input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label htmlFor="signup-confirm-password" className="label">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    className="input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={state.loading}
                  className="btn btn-primary w-full py-3 text-base"
                >
                  {state.loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}