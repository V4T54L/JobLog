let currentTheme = localStorage.getItem('theme') || 'light';

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

export const getTheme = () => currentTheme;

export const toggleTheme = () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    return currentTheme;
};

export const initializeTheme = () => {
    applyTheme(currentTheme);
};

