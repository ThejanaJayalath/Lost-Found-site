export type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'post_view_preference';

/**
 * Get the saved view preference from localStorage
 * Defaults to 'list' if not set
 */
export const getViewPreference = (): ViewMode => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'grid' || saved === 'list') {
            return saved;
        }
    } catch (e) {
        console.warn('Failed to read view preference:', e);
    }
    return 'list'; // Default to list view
};

/**
 * Save the view preference to localStorage
 */
export const saveViewPreference = (view: ViewMode): void => {
    try {
        localStorage.setItem(STORAGE_KEY, view);
    } catch (e) {
        console.warn('Failed to save view preference:', e);
    }
};


