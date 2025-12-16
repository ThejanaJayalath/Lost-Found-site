import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';
import { getApiBaseUrl } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<void>;
    syncUserWithBackend: (user: User, additionalData?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for redirect result on mount (for Google sign-in)
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    syncUserWithBackend(result.user, { authProvider: 'google' });
                }
            })
            .catch((error) => {
                console.error('Error getting redirect result:', error);
            });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const googleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            // Use redirect instead of popup to avoid COOP issues
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error('Error initiating Google sign-in:', error);
            throw error;
        }
    };

    const syncUserWithBackend = async (user: User, additionalData: any = {}) => {
        try {
            if (!user.email) {
                console.warn('User email is missing, skipping backend sync');
                return;
            }

            const apiUrl = getApiBaseUrl();
            if (!apiUrl) {
                console.warn('API URL is not configured, skipping backend sync');
                return;
            }

            const userData = {
                email: user.email,
                name: user.displayName || user.email,
                phoneNumber: additionalData.phoneNumber || null,
            };

            const fullUrl = `${apiUrl}/users`;
            console.log('Syncing user with backend:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                console.error('Backend sync failed:', response.status, errorData);
            } else {
                console.log('User synced successfully with backend');
            }
        } catch (error: any) {
            console.error('Error syncing user with backend:', error.message || error);
            // Don't throw - this is a background sync, shouldn't block auth
        }
    };

    const value = {
        user,
        loading,
        logout,
        googleSignIn,
        syncUserWithBackend
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
