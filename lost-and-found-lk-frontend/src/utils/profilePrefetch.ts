import { getApiBaseUrl } from '../services/api';

interface ProfileCache {
    userData: any;
    posts: any[];
    foundPosts: any[];
    notifications: any[];
    timestamp: number;
}

const CACHE_KEY = 'profile_prefetch_cache';
const CACHE_DURATION = 30000; // 30 seconds - cache is valid for 30 seconds

/**
 * Prefetch all profile data in the background
 * This is called when user submits a report to start loading profile data early
 */
export const prefetchProfileData = async (userEmail: string): Promise<void> => {
    if (!userEmail) return;

    try {
        // Start all API calls in parallel
        const [userDataResponse, userResponse] = await Promise.all([
            fetch(`${getApiBaseUrl()}/users/${userEmail}`),
            fetch(`${getApiBaseUrl()}/users/${userEmail}`) // Need user ID for posts
        ]);

        if (!userResponse.ok) return;

        const userData = await userResponse.json();
        const userId = userData.id;

        // Fetch all profile data in parallel
        const [postsResponse, foundPostsResponse, notificationsResponse] = await Promise.all([
            fetch(`${getApiBaseUrl()}/posts/user/${userId}`),
            fetch(`${getApiBaseUrl()}/interactions/user/${userEmail}/found`),
            fetch(`${getApiBaseUrl()}/interactions/user/${userEmail}/claims`)
        ]);

        // Parse all responses
        const posts = postsResponse.ok ? await postsResponse.json() : [];
        const foundPosts = foundPostsResponse.ok ? await foundPostsResponse.json() : [];
        const notifications = notificationsResponse.ok ? await notificationsResponse.json() : [];

        // Store in cache
        const cache: ProfileCache = {
            userData,
            posts,
            foundPosts,
            notifications: notifications.filter((n: any) => n.status === 'PENDING'),
            timestamp: Date.now()
        };

        // Store in sessionStorage (cleared when browser tab closes)
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn('Failed to store profile cache:', e);
        }
    } catch (error) {
        console.error('Error prefetching profile data:', error);
        // Don't throw - prefetch failures shouldn't break the app
    }
};

/**
 * Get cached profile data if available and fresh
 */
export const getCachedProfileData = (): ProfileCache | null => {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cache: ProfileCache = JSON.parse(cached);
        const age = Date.now() - cache.timestamp;

        // Return cache if it's less than 30 seconds old
        if (age < CACHE_DURATION) {
            return cache;
        }

        // Cache expired, remove it
        sessionStorage.removeItem(CACHE_KEY);
        return null;
    } catch (e) {
        console.warn('Failed to read profile cache:', e);
        return null;
    }
};

/**
 * Clear the profile cache (useful when data changes)
 */
export const clearProfileCache = (): void => {
    try {
        sessionStorage.removeItem(CACHE_KEY);
    } catch (e) {
        console.warn('Failed to clear profile cache:', e);
    }
};

