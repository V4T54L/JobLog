import { BlogService } from '../../services/blogService.js';
import { BlogPostCard } from '../../components/BlogPostCard.js';
import { navigate } from '../../router.js';
import { isLoggedIn } from '../../state/authState.js';

export const BlogListView = {
    render: async (container) => {
        const showCreateButton = isLoggedIn();
        container.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold">Blog</h1>
                    ${showCreateButton ? `
                    <button id="create-post-btn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Create New Post
                    </button>
                    ` : ''}
                </div>
                <div id="blog-list" class="space-y-6">
                    <p>Loading posts...</p>
                </div>
            </div>
        `;

        if (showCreateButton) {
            container.querySelector('#create-post-btn').addEventListener('click', () => {
                navigate('/blog/new');
            });
        }

        const blogListContainer = container.querySelector('#blog-list');
        try {
            const posts = await BlogService.getPublicPosts();
            if (posts && posts.length > 0) {
                blogListContainer.innerHTML = '';
                posts.forEach(post => {
                    blogListContainer.appendChild(BlogPostCard(post));
                });
            } else {
                blogListContainer.innerHTML = '<p>No blog posts found.</p>';
            }
        } catch (error) {
            blogListContainer.innerHTML = `<p class="text-red-500">Error loading posts: ${error.message}</p>`;
        }
    }
};

