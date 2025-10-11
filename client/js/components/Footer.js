export const Footer = () => {
    const footer = document.createElement('footer');
    footer.className = 'bg-white dark:bg-gray-800 shadow-inner mt-auto p-4 text-center text-gray-600 dark:text-gray-400';
    footer.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} Job App Tracker. All rights reserved.</p>
    `;
    return footer;
};

