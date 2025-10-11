import { BlogService } from '../../services/blogService.js';
import { isLoggedIn } from '../../state/authState.js';
import { CommentItem } from '../../components/CommentItem.js';

function renderComments(comments, postId, onCommentAdded) {
    const container = document.createElement('div');
    comments.forEach(comment => {
        container.appendChild(CommentItem(comment, postId, onCommentAdded));
    });
    return container;
}

export const BlogPostDetailView = {
    render: async (container, params) => {
        container.innerHTML = `<p class="text-center">Loading post...</p>`;

        try {
            const post = await BlogService.getPublicPost(params.username, params.slug);
            if (!post) {
                container.innerHTML = `<p class="text-center">Post not found.</p>`;
                return;
            }

            const postDate = new Date(post.created_at).toLocaleDateString();
            container.innerHTML = `
                <article class="max-w-4xl mx-auto p-4">
                    <h1 class="text-4xl font-bold mb-2">${post.title}</h1>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">By ${post.username} on ${postDate}</p>
                    <div class="prose dark:prose-invert lg:prose-xl max-w-none mb-8">
                        ${post.content_html}
                    </div>
                    <div class="flex items-center space-x-4 mb-8">
                        <button id="like-post-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" data-content-type="post" data-content-id="${post.id}">
                            Like Post
                        </button>
                    </div>
                    <hr class="my-8 border-gray-200 dark:border-gray-700">
                    <section id="comments-section">
                        <h2 class="text-2xl font-bold mb-4">Comments</h2>
                        <div id="comments-list" class="space-y-4"></div>
                        ${isLoggedIn() ? `
                        <form id="new-comment-form" class="mt-6">
                            <h3 class="text-lg font-semibold mb-2">Leave a Comment</h3>
                            <textarea name="content_md" class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" rows="4" placeholder="Write your comment here..."></textarea>
                            <button type="submit" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Post Comment</button>
                        </form>
                        ` : '<p class="mt-6">You must be <a href="/login" data-link class="text-blue-500 hover:underline">logged in</a> to comment.</p>'}
                    </section>
                </article>
            `;

            const commentsList = container.querySelector('#comments-list');
            const comments = await BlogService.getComments(post.id);

            const onCommentAdded = (newComment, parentId) => {
                const newCommentEl = CommentItem(newComment, post.id, onCommentAdded);
                if (parentId) {
                    const parentEl = commentsList.querySelector(`.comment-item[data-comment-id="${parentId}"] .replies-container`);
                    if (parentEl) {
                        parentEl.appendChild(newCommentEl);
                    }
                } else {
                    commentsList.appendChild(newCommentEl);
                }
            };

            commentsList.appendChild(renderComments(comments, post.id, onCommentAdded));

            if (isLoggedIn()) {
                const newCommentForm = container.querySelector('#new-comment-form');
                newCommentForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(newCommentForm);
                    const content_md = formData.get('content_md');
                    if (!content_md.trim()) return;

                    try {
                        const newComment = await BlogService.addComment(post.id, { content_md, parent_comment_id: null });
                        onCommentAdded(newComment, null);
                        newCommentForm.reset();
                    } catch (error) {
                        console.error('Failed to add comment:', error);
                        alert('Could not post comment.');
                    }
                });
            }

            // Like functionality
            container.addEventListener('click', async (e) => {
                if (e.target.matches('.like-comment-btn, #like-post-btn')) {
                    if (!isLoggedIn()) {
                        alert('You must be logged in to like content.');
                        return;
                    }
                    const button = e.target;
                    const contentType = button.dataset.contentType;
                    const contentId = parseInt(button.dataset.contentId, 10);
                    try {
                        const result = await BlogService.toggleLike({ content_type: contentType, content_id: contentId });
                        button.textContent = result.is_liked ? 'Unlike' : 'Like';
                        button.classList.toggle('bg-red-500', result.is_liked);
                        button.classList.toggle('hover:bg-red-600', result.is_liked);
                        button.classList.toggle('bg-blue-600', !result.is_liked);
                        button.classList.toggle('hover:bg-blue-700', !result.is_liked);
                    } catch (error) {
                        console.error('Failed to toggle like:', error);
                        alert('An error occurred while liking.');
                    }
                }
            });

        } catch (error) {
            console.error('Failed to load post:', error);
            container.innerHTML = `<p class="text-center text-red-500">Error loading post. ${error.message}</p>`;
        }
    }
};
