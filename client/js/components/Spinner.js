export const Spinner = () => {
    const spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'flex justify-center items-center p-8';
    spinnerDiv.innerHTML = `
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    `;
    return spinnerDiv;
};

