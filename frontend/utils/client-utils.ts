/**
 * Checks if code is running on the client side
 */
export const isClient = typeof window !== "undefined";

/**
 * Safely gets the document element's dark mode status
 */
export const isDarkMode = (): boolean => {
    if (!isClient) return false;
    return document.documentElement.classList.contains("dark");
};

/**
 * Safe storage operations
 */
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        if (!isClient) return null;
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        if (!isClient) return;
        localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
        if (!isClient) return;
        localStorage.removeItem(key);
    },
};
