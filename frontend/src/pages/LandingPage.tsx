import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from '../components/AuthModal';
import { 
  FileText, 
  PenTool, 
  BarChart3, 
  Users, 
  Clock, 
  Target,
  Moon,
  Sun
} from 'lucide-react';

export default function LandingPage() {
  const { state: authState } = useAuth();
  const { state: themeState, toggleTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const features = [
    {
      icon: FileText,
      title: 'Application Tracker',
      description: 'Keep track of all your job applications in one organized place. Monitor status, dates, and progress.',
    },
    {
      icon: PenTool,
      title: 'Job Search Blog',
      description: 'Document your journey, share insights, and connect with other job seekers through your personal blog.',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Visualize your job search progress with charts and insights to help you stay motivated and focused.',
    },
  ];

  const stats = [
    {
      icon: Users,
      number: '10,000+',
      label: 'Job Seekers',
    },
    {
      icon: Clock,
      number: '50%',
      label: 'Faster Job Search',
    },
    {
      icon: Target,
      number: '90%',
      label: 'Success Rate',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[var(--foreground)]">JobLog</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Toggle theme"
              >
                {themeState.isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => openAuthModal('signin')}
                className="btn btn-ghost !hidden md:!block"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-[var(--foreground)] mb-6">
              Organize Your Job Search,{' '}
              <span className="text-[var(--primary)]">All In One Place</span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] mb-8 leading-relaxed">
              Track applications, write about your journey, and visualize your progress 
              with the most comprehensive job search tool for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openAuthModal('signup')}
                className="btn btn-primary text-lg px-8 py-4"
              >
                Start Your Journey
              </button>
              <button
                onClick={() => openAuthModal('signin')}
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Sign In
              </button>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-4">
              Demo: username "demo", password "password"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--muted)]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              JobLog combines powerful organization tools with personal storytelling 
              to help you stay motivated and track your progress throughout your job search.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  className="card text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)]">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-[var(--accent)] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-[var(--accent-foreground)]" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--foreground)] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--primary)] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of job seekers who have organized their search 
              and landed their dream jobs with JobLog.
            </p>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn bg-white text-[var(--primary)] hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
            >
              Get Started Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-[var(--muted-foreground)]">
                © 2024 JobLog. Built with React & TypeScript.
              </span>
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              Organize your job search, all in one place.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}