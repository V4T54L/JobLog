import { UserService } from '../../services/userService.js';
import { BlogPostCard } from '../../components/BlogPostCard.js';
import { getUser, isLoggedIn } from '../../state/authState.js';

export const ProfileView = {
    render: async (container, params) => {
        container.innerHTML = `<p class="text-center mt-8">Loading profile...</p>`;
        const { username } = params;
        const loggedInUser = getUser();

        try {
            const profile = await UserService.getProfile(username);
            const { user, posts, isFollowing, followerCount, followingCount } = profile;

            let followButton = '';
            if (isLoggedIn() && loggedInUser.id !== user.id) {
                followButton = `
                    <button id="follow-btn" class="px-4 py-2 text-sm font-medium rounded-md ${isFollowing ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}">
                        ${isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                `;
            }

            container.innerHTML = `
                <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <div class="flex flex-col sm:flex-row items-center sm:items-start">
                            <img src="${user.avatar_url?.String || 'https://via.placeholder.com/150'}" alt="${user.username}'s avatar" class="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6">
                            <div class="flex-grow text-center sm:text-left">
                                <div class="flex items-center justify-center sm:justify-between">
                                    <h1 class="text-3xl font-bold">${user.username}</h1>
                                    ${followButton}
                                </div>
                                <div class="flex justify-center sm:justify-start space-x-4 mt-2 text-gray-600 dark:text-gray-400">
                                    <span><strong>${posts.length}</strong> posts</span>
                                    <span><strong>${followerCount}</strong> followers</span>
                                    <span><strong>${followingCount}</strong> following</span>
                                </div>
                                <p class="mt-4 text-gray-700 dark:text-gray-300">${user.bio?.String || 'No bio provided.'}</p>
                            </div>
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold mb-4">Public Posts</h2>
                    <div id="posts-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${posts.length > 0 ? '' : '<p>This user has no public posts.</p>'}
                    </div>
                </div>
            `;

            const postsContainer = container.querySelector('#posts-container');
            posts.forEach(post => {
                postsContainer.appendChild(BlogPostCard(post));
            });

            const followBtn = container.querySelector('#follow-btn');
            if (followBtn) {
                followBtn.addEventListener('click', async () => {
                    try {
                        const currentActionIsFollow = !followBtn.textContent.trim().toLowerCase().includes('unfollow');
                        if (currentActionIsFollow) {
                            await UserService.follow(username);
                            followBtn.textContent = 'Unfollow';
                            followBtn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
                            followBtn.classList.add('bg-gray-200', 'dark:bg-gray-600', 'text-gray-800', 'dark:text-gray-200');
                        } else {
                            await UserService.unfollow(username);
                            followBtn.textContent = 'Follow';
                            followBtn.classList.remove('bg-gray-200', 'dark:bg-gray-600', 'text-gray-800', 'dark:text-gray-200');
                            followBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
                        }
                        // Optionally re-fetch profile to update follower count, or update it manually
                    } catch (error) {
                        console.error('Failed to update follow status:', error);
                        alert('Could not update follow status. Please try again.');
                    }
                });
            }

        } catch (error) {
            container.innerHTML = `<p class="text-center mt-8 text-red-500">Could not load profile: ${error.message}</p>`;
        }
    }
};
```
