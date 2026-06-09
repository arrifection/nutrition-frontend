import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
    getMe,
    loginUser,
    registerUser,
    logoutUser,
    refreshSession,
    clearAuthStorage,
    storeAuthTokens,
    TOKEN_KEY,
    USER_KEY,
    TOKEN_EXPIRES_KEY,
} from "../services/api";

const AuthContext = createContext(null);

const REFRESH_BUFFER_MS = 2 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshTimerRef = useRef(null);

    const clearSession = useCallback(() => {
        clearAuthStorage();
        setUser(null);
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    const scheduleTokenRefresh = useCallback((expiresAtMs) => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        if (!expiresAtMs) return;

        const delay = Math.max(expiresAtMs - Date.now() - REFRESH_BUFFER_MS, 5000);
        refreshTimerRef.current = setTimeout(async () => {
            const result = await refreshSession();
            if (result.success) {
                storeAuthTokens(result.data);
                scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
            } else {
                clearSession();
                window.dispatchEvent(new Event("dietdesk:auth-expired"));
            }
        }, delay);
    }, [clearSession]);

    useEffect(() => {
        let cancelled = false;

        const rehydrateSession = async () => {
            const storedUser = localStorage.getItem(USER_KEY);
            const storedToken = localStorage.getItem(TOKEN_KEY);

            if (!storedUser || !storedToken) {
                setLoading(false);
                return;
            }

            try {
                const parsedUser = JSON.parse(storedUser);
                const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_KEY) || 0);
                if (expiresAt && expiresAt <= Date.now()) {
                    const refreshResult = await refreshSession();
                    if (!refreshResult.success) {
                        if (!cancelled) clearSession();
                        return;
                    }
                    storeAuthTokens(refreshResult.data);
                }

                const meResult = await Promise.race([
                    getMe(),
                    new Promise((resolve) => {
                        setTimeout(() => resolve({ success: false, error: "Session check timed out" }), 10000);
                    }),
                ]);

                if (cancelled) return;

                if (meResult.success) {
                    const normalizedUser = {
                        username: meResult.data.username || parsedUser.username,
                        email: meResult.data.email || parsedUser.email,
                        role: meResult.data.role || parsedUser.role || "client",
                        email_verified: meResult.data.email_verified ?? false,
                        verification_deadline: meResult.data.verification_deadline,
                    };
                    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
                    setUser(normalizedUser);
                    scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
                } else {
                    clearSession();
                }
            } catch {
                if (!cancelled) clearSession();
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        rehydrateSession();

        return () => {
            cancelled = true;
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [clearSession, scheduleTokenRefresh]);

    useEffect(() => {
        const onAuthExpired = () => clearSession();
        window.addEventListener("dietdesk:auth-expired", onAuthExpired);
        return () => window.removeEventListener("dietdesk:auth-expired", onAuthExpired);
    }, [clearSession]);

    const normalizeEmail = (value) => value.trim().toLowerCase();

    const login = async (email, password) => {
        const normalizedEmail = normalizeEmail(email);
        const result = await loginUser({ email: normalizedEmail, password });
        if (!result.success) {
            return { success: false, error: result.error || "Login failed" };
        }

        const { access_token, refresh_token, expires_in, username, role } = result.data;
        storeAuthTokens({ access_token, refresh_token, expires_in });

        const meResult = await getMe();
        const profile = meResult.success ? meResult.data : {};
        const userData = {
            username: profile.username || username,
            email: profile.email || result.data.email || normalizedEmail,
            role: profile.role || role || "client",
            email_verified: profile.email_verified === true,
            verification_deadline: profile.verification_deadline,
        };

        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        sessionStorage.setItem("dietdesk_login_success", `Welcome, ${userData.username || userData.email}. Login successful.`);
        setUser(userData);
        scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
        return { success: true, user: userData };
    };

    const register = async (username, email, password) => {
        const result = await registerUser({
            username,
            email: normalizeEmail(email),
            password,
            role: "dietitian",
        });
        if (!result.success) {
            return { success: false, error: result.error || "Registration failed" };
        }
        return {
            success: true,
            emailSent: result.data?.email_sent !== false,
        };
    };

    const logout = async () => {
        await logoutUser();
        clearSession();
    };

    const value = { user, isAuthenticated: Boolean(user), login, logout, register, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
