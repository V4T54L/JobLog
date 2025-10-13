import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Applications = React.lazy(() => import('./pages/Applications'));
const ApplicationDetail = React.lazy(() => import('./pages/ApplicationDetail'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogEditor = React.lazy(() => import('./pages/BlogEditor'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="lg" text="Loading..." />
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/applications/:id" element={<ApplicationDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/new" element={<BlogEditor />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;