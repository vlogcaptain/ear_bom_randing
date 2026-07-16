'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // App Webview Bridge Auto-Login check
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            let appUid = params.get('app_uid');
            let appPhone = params.get('app_phone');
            let appEmail = params.get('app_email');

            // Fallback to sessionStorage if parameters are missing from current URL (e.g. after redirects)
            if (!appUid) {
                appUid = sessionStorage.getItem('app_uid');
                appPhone = sessionStorage.getItem('app_phone');
                appEmail = sessionStorage.getItem('app_email');
            } else {
                // Save to sessionStorage when parameters are present in URL
                sessionStorage.setItem('app_uid', appUid);
                if (appPhone) sessionStorage.setItem('app_phone', appPhone);
                if (appEmail) sessionStorage.setItem('app_email', appEmail);
            }

            if (appUid) {
                // Restore session from App parameters
                const appUser = {
                    uid: appUid,
                    phoneNumber: appPhone || null,
                    email: appEmail || (appPhone ? `${appPhone}@earbom.com` : 'app_user@earbom.com'),
                    displayName: appPhone || '앱 사용자',
                    isAppBridge: true
                };
                setUser(appUser);
                setLoading(false);
                return;
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        setUser(null);
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
