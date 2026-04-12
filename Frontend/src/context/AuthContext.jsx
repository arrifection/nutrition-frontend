import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'dietdesk_token';
const USER_KEY  = 'dietdesk_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true); // true while rehydrating from localStorage

    // Rehydrate session from localStorage on first load
    useEffect(() => {
        try {
            const storedUser  = localStorage.getItem(USER_KEY);
            const storedToken = localStorage.getItem(TOKEN_KEY);
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            // Corrupt storage — clear it
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const result = await loginUser({ email, password });
        if (!result.success) {
            return { success: false, error: result.error || 'Login failed' };
        }
        const { access_token, username, role } = result.data;
        const userData = { username, email, role };

        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        return { success: true };
    };

    const register = async (username, email, password, role) => {
        const result = await registerUser({ username, email, password, role });
        if (!result.success) {
            return { success: false, error: result.error || 'Registration failed' };
        }
        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    const value = { user, login, logout, register, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
