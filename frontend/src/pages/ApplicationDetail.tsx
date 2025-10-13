import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, CreditCard as Edit, Trash2, Calendar, Building, User, Clock } from 'lucide-react';
import { 
  getApplication, 
  updateApplicationStatus, 
  addNoteToApplication, 
  deleteNote 
} from '../api/applications';
import { Application, Note, CreateNoteData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await getApplication(id);
      setApplication(response.data);
    } catch (err) {
      setError('Application not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (!application) return;
    
    setUpdatingStatus(true);
    try {
      const response = await updateApplicationStatus(application.id, newStatus);
      setApplication(response.data);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const noteData: CreateNoteData = {
        content: newNote.trim()
      };
      
      await addNoteToApplication(application.id, noteData);
      await loadApplication(); // Reload to get updated data
      setNewNote('');
    } catch (err) {
      setError('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!application) return;

    try {
      await deleteNote(application.id, noteId);
      await loadApplication(); // Reload to get updated data
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--error)] mb-4">{error || 'Application not found'}</p>
          <button
            onClick={() => navigate('/applications')}
            className="btn btn-primary"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/applications')}
              className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                {application.role}
              </h1>
              <p className="text-xl text-[var(--muted-foreground)]">
                at {application.company}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value as Application['status'])}
              disabled={updatingStatus}
              className="input min-w-[140px]"
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>
            {updatingStatus && <LoadingSpinner size="sm" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                Application Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Company</p>
                    <p className="font-medium text-[var(--foreground)]">{application.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Role</p>
                    <p className="font-medium text-[var(--foreground)]">{application.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Applied On</p>
                    <p className="font-medium text-[var(--foreground)]">{formatDate(application.date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Last Updated</p>
                    <p className="font-medium text-[var(--foreground)]">{formatDate(application.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[var(--muted-foreground)]">Current Status:</span>
                  <StatusBadge status={application.status} />
                </div>
              </div>
            </motion.div>

            {/* Notes Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  Notes ({application.notes.length})
                </h2>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this application..."
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--input)] text-[var(--foreground)] resize-none focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="btn btn-primary"
                  >
                    {isAddingNote ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {application.notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-[var(--muted)] rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-[var(--foreground)] whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-2">
                            {formatDateTime(note.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {application.notes.length === 0 && (
                  <div className="text-center py-8 text-[var(--muted-foreground)]">
                    <Edit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notes yet. Add your first note above.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Activity Timeline
              </h3>
              
              <div className="space-y-4">
                {application.history.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--foreground)]">{event.event}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Days since applied:</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {Math.floor((new Date().getTime() - new Date(application.date).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Total notes:</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {application.notes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Status changes:</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {application.history.filter(h => h.event.includes('Status changed')).length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}