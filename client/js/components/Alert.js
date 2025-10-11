export const Alert = (message, type = 'error') => {
    const colorClasses = {
        error: 'bg-red-100 border-red-400 text-red-700',
        success: 'bg-green-100 border-green-400 text-green-700',
    };

    const alertDiv = document.createElement('div');
    alertDiv.className = `border px-4 py-3 rounded relative ${colorClasses[type] || colorClasses['error']}`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `<span class="block sm:inline">${message}</span>`;
    return alertDiv;
};

