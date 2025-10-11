import { BlogService } from '../../services/blogService.js';

export const BlogPostDetailView = {
    render: async (container, params) => {
        container.innerHTML = `<div class="container mx-auto px-4 py-8"><p>Loading post...</p></div>`;

        try {
            const post = await BlogService.getPublicPost(params.username, params.slug);
            if (post) {
                container.innerHTML = `
                    <div class="container mx-auto px-4 py-8">
                        <article class="prose dark:prose-invert lg:prose-xl max-w-none">
                            <h1 class="text-4xl font-extrabold mb-4">${post.title}</h1>
                            <div class="text-gray-500 dark:text-gray-400 mb-8">
                                By ${post.username} on ${new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <div id="post-content">
                                <!-- Sanitized HTML from backend will be inserted here -->
                            </div>
                        </article>
                    </div>
                `;
                // Use innerHTML as the content is already sanitized on the backend
                container.querySelector('#post-content').innerHTML = post.contentHtml;
            } else {
                container.innerHTML = `<div class="container mx-auto px-4 py-8"><p>Post not found.</p></div>`;
            }
        } catch (error) {
            container.innerHTML = `<div class="container mx-auto px-4 py-8"><p class="text-red-500">Error loading post: ${error.message}</p></div>`;
        }
    }
};

