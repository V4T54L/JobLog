export const ApplicationCard = (app) => {
    const card = document.createElement('a');
    card.href = `/applications/${app.ID}`;
    card.setAttribute('data-link', '');
    card.className = 'block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200';

    const date = new Date(app.DateApplied).toLocaleDateString();

    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400">${app.RoleID}</h3>
                <p class="text-gray-600 dark:text-gray-400">${app.CompanyID}</p>
            </div>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">${app.Status}</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Applied on: ${date}</p>
    `;
    // TODO: Fetch and display actual company/role names instead of IDs
    return card;
};

