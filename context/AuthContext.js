'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for local demo user first
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
            setUser(JSON.parse(demoUser));
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('demo_user');
        await signOut(auth);
    };

    const loginAsDemo = () => {
        const mockUser = {
            uid: 'demo-user-123',
            displayName: '데모 사용자',
            email: 'demo@example.com'
        };
        setUser(mockUser);
        localStorage.setItem('demo_user', JSON.stringify(mockUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginAsDemo }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
