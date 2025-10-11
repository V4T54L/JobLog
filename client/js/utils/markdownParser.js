export const parseMarkdown = (markdownText) => {
    if (window.marked) {
        // In a real app, you'd configure marked with sanitization options
        return window.marked.parse(markdownText, { gfm: true, breaks: true });
    }
    console.error("Marked.js library not loaded.");
    return markdownText; // Fallback
};

