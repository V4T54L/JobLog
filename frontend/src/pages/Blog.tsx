import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  Heart,
  MessageSquare,
  Calendar,
  Eye,
  Globe,
  Lock
} from 'lucide-react';
import { getBlogPosts } from '../api/blog';
import { BlogPost } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrivate, setShowPrivate] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [blogPosts, searchTerm, showPrivate]);

  const loadBlogPosts = async () => {
    try {
      const response = await getBlogPosts(false); // Get all posts
      setBlogPosts(response.data);
    } catch (err) {
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVisibility = showPrivate || post.isPublic;
      return matchesSearch && matchesVisibility;
    });

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove markdown formatting and get plain text
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength).trim() + '...'
      : plainText;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog posts..." />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Blog</h1>
            <p className="text-[var(--muted-foreground)]">
              Document your job search journey and share insights
            </p>
          </div>
          <Link
            to="/blog/new"
            className="btn btn-primary mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Visibility Filter */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrivate}
                  onChange={(e) => setShowPrivate(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--primary)]"
                />
                <span className="text-sm text-[var(--foreground)]">Show private posts</span>
              </label>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-sm text-[var(--muted-foreground)]">
              <Filter className="w-4 h-4 mr-2" />
              {filteredPosts.length} of {blogPosts.length} posts
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {blogPosts.length === 0 ? (
          <div className="text-center py-16">
            <Plus className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              No blog posts yet
            </h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Start documenting your job search journey and share your insights
            </p>
            <Link
              to="/blog/new"
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-lg transition-shadow group"
                >
                  {/* Cover Image */}
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      {post.isPublic ? (
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </div>
                      ) : (
                        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block hover:text-[var(--primary)] transition-colors"
                    >
                      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-3">
                      {getExcerpt(post.content)}
                    </p>

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.authorAvatar}
                          alt={post.author}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {post.author}
                          </p>
                          <div className="flex items-center text-xs text-[var(--muted-foreground)]">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {post.comments.length}
                        </div>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center hover:text-[var(--primary)] transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Read more
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredPosts.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              No posts found
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}