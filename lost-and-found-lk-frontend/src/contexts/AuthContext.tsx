import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await syncUserWithBackend(result.user, { authProvider: 'google' });
    };

    const syncUserWithBackend = async (user: User, additionalData: any = {}) => {
        try {
            const userData = {
                email: user.email,
                name: user.displayName,
                photoUrl: user.photoURL,
                phoneNumber: additionalData.phoneNumber || null,
                authProvider: additionalData.authProvider || 'local',
                password: additionalData.password || null
            };

            await fetch(`${getApiBaseUrl()}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
        } catch (error) {
            console.error('Error syncing user with backend:', error);
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
