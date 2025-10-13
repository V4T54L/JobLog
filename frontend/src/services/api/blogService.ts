
import apiClient from './apiClient';
import type { BlogPost, NewBlogPost } from './types';

/**
 * Fetches all public blog posts.
 */
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const response = await apiClient.get<BlogPost[]>('/blog');
  return response.data;
};

/**
 * Fetches a single blog post by its URL slug.
 */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  const response = await apiClient.get<BlogPost>(`/blog/${slug}`);
  return response.data;
};

/**
 * Creates a new blog post. Requires authentication.
 */
export const createBlogPost = async (newPostData: NewBlogPost): Promise<BlogPost> => {
  const response = await apiClient.post<BlogPost>('/blog', newPostData);
  return response.data;
};
