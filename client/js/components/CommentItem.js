import { BlogService } from '../services/blogService.js';
import { isLoggedIn } from '../state/authState.js';

function createCommentForm(postId, parentCommentId, onCommentAdded) {
    const form = document.createElement('form');
    form.className = 'mt-2';
    form.innerHTML = `
        <textarea name="content_md" class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" rows="2" placeholder="Write a reply..."></textarea>
        <div class="flex justify-end mt-2">
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Reply</button>
        </div>
    `;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const content_md = formData.get('content_md');
        if (!content_md.trim()) return;

        try {
            const newComment = await BlogService.addComment(postId, {
                content_md,
                parent_comment_id: parentCommentId,
            });
            onCommentAdded(newComment, parentCommentId);
            form.remove(); // Hide form after successful submission
        } catch (error) {
            console.error('Failed to add comment:', error);
            // Optionally show an error message to the user
        }
    });

    return form;
}

export const CommentItem = (comment, postId, onCommentAdded) => {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment-item py-2';
    commentEl.dataset.commentId = comment.id;

    const author = comment.username?.String || 'Anonymous';
    const date = new Date(comment.created_at).toLocaleDateString();

    commentEl.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                    ${author.charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="flex-1">
                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p class="font-semibold text-sm">${author}</p>
                    <div class="prose prose-sm dark:prose-invert max-w-none">${comment.content_html}</div>
                </div>
                <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>${date}</span>
                    <button class="like-comment-btn font-semibold hover:underline" data-content-type="comment" data-content-id="${comment.id}">Like</button>
                    ${isLoggedIn() ? `<button class="reply-btn font-semibold hover:underline">Reply</button>` : ''}
                </div>
                <div class="reply-form-container mt-2"></div>
            </div>
        </div>
    `;

    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700';
    if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
            repliesContainer.appendChild(CommentItem(reply, postId, onCommentAdded));
        });
    }
    commentEl.appendChild(repliesContainer);

    const replyBtn = commentEl.querySelector('.reply-btn');
    if (replyBtn) {
        replyBtn.addEventListener('click', () => {
            const replyFormContainer = commentEl.querySelector('.reply-form-container');
            if (replyFormContainer.innerHTML === '') {
                const form = createCommentForm(postId, comment.id, onCommentAdded);
                replyFormContainer.appendChild(form);
            } else {
                replyFormContainer.innerHTML = '';
            }
        });
    }

    return commentEl;
};

