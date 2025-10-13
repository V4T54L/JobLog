import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Send,
  Calendar,
  Globe,
  Lock,
  ThumbsUp
} from 'lucide-react';
import { getBlogPost, likeBlogPost, addCommentToBlogPost } from '../api/blog';
import { BlogPost as BlogPostType, Comment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const response = await getBlogPost(slug);
      setPost(response.data);
    } catch (err) {
      setError('Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || isLiking) return;

    setIsLiking(true);
    try {
      const response = await likeBlogPost(post.id);
      setPost(response.data);
    } catch (err) {
      console.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await addCommentToBlogPost(post.id, newComment.trim());
      await loadBlogPost(); // Reload to get updated comments
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
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
        <LoadingSpinner size="lg" text="Loading blog post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--error)] mb-4">{error || 'Blog post not found'}</p>
          <button
            onClick={() => navigate('/blog')}
            className="btn btn-primary"
          >
            Back to Blog
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
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </button>
          
          <div className="flex items-center space-x-2">
            {post.isPublic ? (
              <div className="flex items-center text-green-600 text-sm">
                <Globe className="w-4 h-4 mr-1" />
                Public
              </div>
            ) : (
              <div className="flex items-center text-gray-600 text-sm">
                <Lock className="w-4 h-4 mr-1" />
                Private
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Cover Image */}
            {post.coverImage && (
              <div className="mb-8">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
              <div className="flex items-center space-x-4">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-[var(--foreground)]">{post.author}</p>
                  <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center space-x-2 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 ${post.likes > 0 ? 'fill-current text-red-500' : ''}`} 
                  />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center space-x-2 text-[var(--muted-foreground)]">
                  <MessageSquare className="w-5 h-5" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-gray max-w-none text-[var(--foreground)]">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </motion.article>

          {/* Comments Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-t border-[var(--border)] pt-8"
          >
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
              Comments ({post.comments.length})
            </h2>

            {/* Add Comment */}
            {authState.isAuthenticated && (
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex items-start space-x-4">
                  <img
                    src={authState.user?.avatar}
                    alt={authState.user?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--input)] text-[var(--foreground)] resize-none focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isCommenting || !newComment.trim()}
                        className="btn btn-primary"
                      >
                        {isCommenting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              <AnimatePresence>
                {post.comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-[var(--muted)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[var(--foreground)]">
                            {comment.author}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-[var(--foreground)] whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 mt-2">
                        <button className="flex items-center space-x-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{comment.likes}</span>
                        </button>
                        
                        {comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleCommentExpansion(comment.id)}
                            className="text-sm text-[var(--primary)] hover:underline"
                          >
                            {expandedComments.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} replies
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      <AnimatePresence>
                        {expandedComments.has(comment.id) && comment.replies.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-6 mt-4 space-y-4 border-l-2 border-[var(--border)] pl-4"
                          >
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start space-x-3">
                                <img
                                  src={reply.avatar}
                                  alt={reply.author}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm text-[var(--foreground)]">
                                        {reply.author}
                                      </span>
                                      <span className="text-xs text-[var(--muted-foreground)]">
                                        {formatDateTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {post.comments.length === 0 && (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Related Posts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t border-[var(--border)] pt-8 mt-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                More Posts
              </h2>
              <Link
                to="/blog"
                className="text-[var(--primary)] hover:underline text-sm"
              >
                View all posts
              </Link>
            </div>
            <p className="text-[var(--muted-foreground)] mt-2">
              Continue exploring job search insights and stories
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}