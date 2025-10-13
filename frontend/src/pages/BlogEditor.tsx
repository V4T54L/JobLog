import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Globe,
  Lock,
  Image,
  Loader
} from 'lucide-react';
import { createBlogPost } from '../services/api/blogService';
import { CreateBlogPostData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function BlogEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useLocalStorage('blog-draft-title', '');
  const [content, setContent] = useLocalStorage('blog-draft-content', '');
  const [coverImage, setCoverImage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save draft
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (title || content) {
        // Draft is auto-saved via useLocalStorage
        console.log('Draft auto-saved');
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [title, content]);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and content');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const postData: CreateBlogPostData = {
        title: title.trim(),
        content: content.trim(),
        isPublic,
        coverImage: coverImage || undefined
      };

      const response = await createBlogPost(postData);
      
      // Clear draft
      setTitle('');
      setContent('');
      setCoverImage('');
      
      // Navigate to the new post
      navigate(`/blog/${response.slug}`);
    } catch (err) {
      setError('Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  const coverImageOptions = [
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/blog')}
              className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                Write New Post
              </h1>
              <p className="text-[var(--muted-foreground)]">
                Share your job search insights and experiences
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`btn ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !title.trim() || !content.trim()}
              className="btn btn-primary"
            >
              {isPublishing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Post Settings */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Post Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="label">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="input"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="label">Visibility</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="text-[var(--primary)]"
                  />
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="text-[var(--primary)]"
                  />
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </label>
              </div>
            </div>

            {/* Cover Image */}
            <div className="md:col-span-2">
              <label className="label">Cover Image</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {coverImageOptions.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setCoverImage(imageUrl)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                      coverImage === imageUrl 
                        ? 'border-[var(--primary)]' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Cover option ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    {coverImage === imageUrl && (
                      <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        {showPreview ? (
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Preview</h3>
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <article className="prose prose-gray max-w-none">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                {title || 'Untitled Post'}
              </h1>
              <div className="text-[var(--foreground)]">
                <ReactMarkdown>{content || 'Start writing your post...'}</ReactMarkdown>
              </div>
            </article>
          </div>
        ) : (
          <div className="editor-container">
            {/* Editor Panel */}
            <div className="editor-panel">
              <div className="p-4 bg-[var(--muted)] border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-medium text-[var(--foreground)]">Markdown Editor</h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Supports Markdown formatting
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here... 

You can use Markdown formatting:
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- List item
[Link text](URL)

Start sharing your job search insights!"
                className="editor-textarea"
              />
            </div>

            {/* Preview Panel */}
            <div className="editor-panel">
              <div className="p-4 bg-[var(--muted)] border-b border-[var(--border)]">
                <h3 className="font-medium text-[var(--foreground)]">Live Preview</h3>
              </div>
              <div className="preview-panel">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                  {title || 'Untitled Post'}
                </h1>
                <div className="text-[var(--foreground)]">
                  <ReactMarkdown>{content || 'Start writing your post...'}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-[var(--muted)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">
            <strong>Tip:</strong> Your draft is automatically saved locally every 30 seconds. 
            Use Markdown syntax for formatting: **bold**, *italic*, # headings, - lists, [links](url).
            {!isPublic && ' This post will only be visible to you.'}
          </p>
        </div>
      </div>
    </div>
  );
}