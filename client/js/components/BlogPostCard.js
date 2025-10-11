export const BlogPostCard = (post) => {
    const card = document.createElement('a');
    card.href = `/blog/${post.username}/${post.slug}`;
    card.setAttribute('data-link', '');
    card.className = 'block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200';

    card.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${post.title}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">${post.excerpt.String || ''}</p>
        <div class="text-sm text-gray-500 dark:text-gray-400">
            <span>By ${post.username}</span> &middot;
            <span>${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
    `;
    return card;
};

