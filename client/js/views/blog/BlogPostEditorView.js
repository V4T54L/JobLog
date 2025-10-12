import { BlogService } from '../../services/blogService.js';
import { navigate } from '../../router.js';
import { parseMarkdown } from '../../utils/markdownParser.js';

let autosaveTimeout;

export const BlogPostEditorView = {
    render: async (container, params) => {
        container.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold mb-6">Create New Post</h1>
                <form id="blog-editor-form" class="space-y-6">
                    <div>
                        <label for="post-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input type="text" id="post-title" name="title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
                        <div>
                            <label for="post-content-md" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (Markdown)</label>
                            <textarea id="post-content-md" name="contentMd" required class="mt-1 block w-full h-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 font-mono p-2"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Preview</label>
                            <div id="post-preview" class="mt-1 p-3 w-full h-full rounded-md border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 prose dark:prose-invert max-w-none overflow-y-auto"></div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input id="is-public" name="isPublic" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            <label for="is-public" class="ml-2 block text-sm text-gray-900 dark:text-gray-200">Publish Publicly</label>
                        </div>
                        <div>
                            <button type="button" id="save-draft-btn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">Save Draft</button>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Publish</button>
                        </div>
                    </div>
                    <div id="editor-status" class="text-sm text-gray-500 h-4"></div>
                </form>
            </div>
        `;

        const form = container.querySelector('#blog-editor-form');
        const markdownInput = container.querySelector('#post-content-md');
        const previewOutput = container.querySelector('#post-preview');
        const statusDiv = container.querySelector('#editor-status');
        const saveDraftBtn = container.querySelector('#save-draft-btn');

        const updatePreview = () => {
            const markdownText = markdownInput.value;
            previewOutput.innerHTML = parseMarkdown(markdownText);
        };

        const handleAutosave = () => {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(() => {
                statusDiv.textContent = `Autosaved at ${new Date().toLocaleTimeString()}`;
            }, 2000);
        };

        markdownInput.addEventListener('input', () => {
            updatePreview();
            handleAutosave();
        });

        const handleSubmit = async (isPublic) => {
            const formData = new FormData(form);
            const postData = {
                title: formData.get('title'),
                contentMd: formData.get('contentMd'),
                isPublic: isPublic,
            };

            if (!postData.title || !postData.contentMd) {
                statusDiv.textContent = 'Title and Content are required.';
                return;
            }

            try {
                statusDiv.textContent = 'Saving...';
                await BlogService.createPost(postData);
                statusDiv.textContent = 'Saved successfully!';
                navigate('/blog');
            } catch (error) {
                statusDiv.textContent = `Error: ${error.message}`;
            }
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const isPublicCheckbox = container.querySelector('#is-public');
            handleSubmit(isPublicCheckbox.checked);
        });

        saveDraftBtn.addEventListener('click', () => {
            handleSubmit(false); // Save as draft
        });

        updatePreview(); // Initial render
    }
};
