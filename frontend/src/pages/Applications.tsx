import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Archive,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getAllApplications, createApplication } from '../services/api/applicationService';
import { Application, CreateApplicationData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'updated' | 'company' | 'role'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadApplications = async () => {
    try {
      const response = await getAllApplications();
      if (response){
        setApplications(response);
      }
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredApplications(filtered);
    setCurrentPage(1);
  };

  const handleSort = (column: typeof sortBy) => {
    if (column === sortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Applications</h1>
            <p className="text-[var(--muted-foreground)]">
              Track and manage your job applications
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search companies or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-[var(--muted-foreground)]">
              <Filter className="w-4 h-4 mr-2" />
              {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <Plus className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                No applications yet
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Start tracking your job applications to stay organized
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Application
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleSort('company')}
                          className="flex items-center hover:text-[var(--foreground)] transition-colors"
                        >
                          Company
                          {sortBy === 'company' && (
                            sortOrder === 'desc' ?
                              <ChevronDown className="w-4 h-4 ml-1" /> :
                              <ChevronUp className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort('role')}
                          className="flex items-center hover:text-[var(--foreground)] transition-colors"
                        >
                          Role
                          {sortBy === 'role' && (
                            sortOrder === 'desc' ?
                              <ChevronDown className="w-4 h-4 ml-1" /> :
                              <ChevronUp className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center hover:text-[var(--foreground)] transition-colors"
                        >
                          Applied
                          {sortBy === 'date' && (
                            sortOrder === 'desc' ?
                              <ChevronDown className="w-4 h-4 ml-1" /> :
                              <ChevronUp className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort('updated')}
                          className="flex items-center hover:text-[var(--foreground)] transition-colors"
                        >
                          Updated
                          {sortBy === 'updated' && (
                            sortOrder === 'desc' ?
                              <ChevronDown className="w-4 h-4 ml-1" /> :
                              <ChevronUp className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginatedApplications.map((application, index) => (
                        <motion.tr
                          key={application.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-[var(--muted)] transition-colors"
                        >
                          <td className="font-medium">{application.company}</td>
                          <td>{application.role}</td>
                          <td>{new Date(application.date).toLocaleDateString()}</td>
                          <td>{new Date(application.updatedAt).toLocaleDateString()}</td>
                          <td>
                            <StatusBadge status={application.status} />
                          </td>
                          <td>
                            <div className="relative">
                              <button
                                onClick={() => setOpenActionMenu(
                                  openActionMenu === application.id ? null : application.id
                                )}
                                className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              <AnimatePresence>
                                {openActionMenu === application.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10"
                                  >
                                    <Link
                                      to={`/applications/${application.id}`}
                                      className="flex items-center px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors first:rounded-t-lg"
                                      onClick={() => setOpenActionMenu(null)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Link>
                                    <button
                                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors last:rounded-b-lg"
                                      onClick={() => {
                                        setOpenActionMenu(null);
                                        // TODO: Implement archive functionality
                                      }}
                                    >
                                      <Archive className="w-4 h-4 mr-2" />
                                      Archive
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of{' '}
                    {filteredApplications.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-ghost disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-ghost disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={loadApplications}
      />
    </div>
  );
}

// Add Application Modal Component
interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

function AddApplicationModal({ isOpen, onClose, onAdd }: AddApplicationModalProps) {
  const [formData, setFormData] = useState<CreateApplicationData>({
    company: '',
    role: '',
    status: 'Applied'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createApplication({ ...formData, date: "some_random_date" });
      onAdd();
      onClose();
      setFormData({ company: '', role: '', status: 'Applied' });
    } catch (err) {
      setError('Failed to create application');
    } finally {
      setLoading(false);
    }
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
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
            Add New Application
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Company</label>
              <input
                type="text"
                required
                className="input"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="label">Role</label>
              <input
                type="text"
                required
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter job title"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Application['status'] })}
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Adding...
                  </>
                ) : (
                  'Add Application'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}