/**
 * Utility functions to synchronize authentication state between
 * localStorage (used by the client) and cookies (used by middleware)
 */

export function syncAuthState(): void {
    // Called on app init and after login/logout
    try {
        const userId = localStorage.getItem("wingmanUserId");

        if (userId) {
            // User is logged in - set cookie with same expiry
            document.cookie = `wingmanUserId=${userId}; path=/; max-age=2592000`; // 30 days
        } else {
            // User is logged out - clear cookie
            document.cookie = "wingmanUserId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    } catch (e) {
        console.error("Failed to sync auth state:", e);
    }
}

// Add this function to components that handle login/logout
// and also call it on _app.tsx or layout.tsx initialization
