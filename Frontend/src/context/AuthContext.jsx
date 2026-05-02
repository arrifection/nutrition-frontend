import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe, loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "dietdesk_token";
const USER_KEY = "dietdesk_user";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearSession = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    useEffect(() => {
        const rehydrateSession = async () => {
            try {
                const storedUser = localStorage.getItem(USER_KEY);
                const storedToken = localStorage.getItem(TOKEN_KEY);

                if (storedUser && storedToken) {
                    const parsedUser = JSON.parse(storedUser);
                    const meResult = await getMe();

                    if (meResult.success) {
                        const normalizedUser = {
                            username: meResult.data.username || parsedUser.username,
                            email: meResult.data.email || parsedUser.email,
                            role: meResult.data.role || parsedUser.role || "client",
                            email_verified: meResult.data.email_verified ?? false,
                            verification_deadline: meResult.data.verification_deadline
                        };
                        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
                        setUser(normalizedUser);
                    } else {
                        clearSession();
                    }
                }
            } catch {
                clearSession();
            } finally {
                setLoading(false);
            }
        };

        rehydrateSession();
    }, []);

    useEffect(() => {
        const onAuthExpired = () => clearSession();
        window.addEventListener("dietdesk:auth-expired", onAuthExpired);
        return () => window.removeEventListener("dietdesk:auth-expired", onAuthExpired);
    }, []);

    const login = async (email, password) => {
        const result = await loginUser({ email, password });
        if (!result.success) {
            return { success: false, error: result.error || "Login failed" };
        }

        const { access_token, username, role, email_verified, verification_deadline } = result.data;
        const userData = { 
            username, 
            email: result.data.email || email, 
            role, 
            email_verified: email_verified ?? false, 
            verification_deadline 
        };

        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        return { success: true };
    };

    const register = async (username, email, password, role) => {
        const result = await registerUser({ username, email, password, role });
        if (!result.success) {
            return { success: false, error: result.error || "Registration failed" };
        }
        return { success: true };
    };

    const logout = () => {
        clearSession();
    };

    const value = { user, login, logout, register, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
