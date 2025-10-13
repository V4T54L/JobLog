import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Gift,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// TODO: update this
import { getDashboardStats } from '../api/dashboard';
import { DashboardStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--error)] mb-4">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(stats.statusBreakdown).map(([status, count]) => ({
    status,
    count,
  }));

  const pieData = Object.entries(stats.statusBreakdown)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  const colors = {
    Applied: '#3B82F6',
    Interviewing: '#F59E0B',
    Offer: '#10B981',
    Rejected: '#EF4444',
    Archived: '#6B7280',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Dashboard</h1>
          <p className="text-[var(--muted-foreground)]">
            Track your job search progress and stay organized
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {stats.totalApplications}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">Total Applications</p>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {stats.interviewing}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">In Progress</p>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {stats.offers}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">Offers Received</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <motion.div variants={itemVariants} className="card">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Application Status Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="status"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div variants={itemVariants} className="card">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[entry.name as keyof typeof colors]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <motion.div variants={itemVariants} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Recent Applications
                </h3>
                <Link
                  to="/applications"
                  className="text-sm text-[var(--primary)] hover:underline flex items-center"
                >
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentApplications.length > 0 ? (
                  stats.recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {app.role}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)] truncate">
                          {app.company}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={app.status} />
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(app.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                    <p className="text-[var(--muted-foreground)] mb-4">No applications yet</p>
                    <Link to="/applications" className="btn btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Application
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Blog Posts */}
            <motion.div variants={itemVariants} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Recent Blog Posts
                </h3>
                <Link
                  to="/blog"
                  className="text-sm text-[var(--primary)] hover:underline flex items-center"
                >
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentBlogPosts.length > 0 ? (
                  stats.recentBlogPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="block p-3 rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                      <p className="font-medium text-[var(--foreground)] truncate mb-1">
                        {post.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center text-xs text-[var(--muted-foreground)]">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {post.likes} likes
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                    <p className="text-[var(--muted-foreground)] mb-4">No blog posts yet</p>
                    <Link to="/blog/new" className="btn btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Write Your First Post
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}