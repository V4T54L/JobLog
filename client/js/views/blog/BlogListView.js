import { BlogService } from '../../services/blogService.js';
import { BlogPostCard } from '../../components/BlogPostCard.js';
import { isLoggedIn } from '../../state/authState.js';

export const BlogListView = {
    render: async (container) => {
        let state = {
            page: 1,
            limit: 10,
            search: '',
        };

        const updateView = async () => {
            const loggedIn = isLoggedIn();
            container.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-bold">Public Blog Posts</h1>
                    ${loggedIn ? '<a href="/blog/new" data-link class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Create New Post</a>' : ''}
                </div>

                <!-- Search -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                    <input type="text" id="search" placeholder="Search by title..." value="${state.search}" class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                </div>

                <div id="blog-list-container" class="space-y-4">
                    <p>Loading posts...</p>
                </div>
                <div id="pagination-container" class="mt-6 flex justify-between items-center"></div>
            `;

            const listContainer = container.querySelector('#blog-list-container');
            const paginationContainer = container.querySelector('#pagination-container');

            try {
                const data = await BlogService.getPublicPosts(state);
                const { posts, pagination } = data;

                if (posts && posts.length > 0) {
                    listContainer.innerHTML = '';
                    posts.forEach(post => {
                        listContainer.appendChild(BlogPostCard(post));
                    });
                } else {
                    listContainer.innerHTML = '<p>No blog posts found.</p>';
                }

                // Render pagination
                paginationContainer.innerHTML = `
                    <div>
                        <span class="text-sm text-gray-700 dark:text-gray-400">
                            Showing page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalItems} total)
                        </span>
                    </div>
                    <div class="inline-flex mt-2 xs:mt-0">
                        <button id="prev-page" class="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                            Prev
                        </button>
                        <button id="next-page" class="px-4 py-2 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                            Next
                        </button>
                    </div>
                `;

                container.querySelector('#prev-page')?.addEventListener('click', () => {
                    if (state.page > 1) {
                        state.page--;
                        updateView();
                    }
                });
                container.querySelector('#next-page')?.addEventListener('click', () => {
                    if (state.page < pagination.totalPages) {
                        state.page++;
                        updateView();
                    }
                });

            } catch (error) {
                listContainer.innerHTML = `<p class="text-red-500">Error loading posts: ${error.message}</p>`;
                paginationContainer.innerHTML = '';
            }

            container.querySelector('#search').addEventListener('change', (e) => {
                state.search = e.target.value;
                state.page = 1;
                updateView();
            });
        };

        await updateView();
    }
};

