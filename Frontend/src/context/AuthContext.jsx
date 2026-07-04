import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
    getMe,
    loginUser,
    registerUser,
    logoutUser,
    refreshSession,
    clearAuthStorage,
    storeAuthTokens,
    verifyMfaLogin as verifyMfaLoginApi,
    TOKEN_KEY,
    USER_KEY,
    TOKEN_EXPIRES_KEY,
} from "../services/api";

const AuthContext = createContext(null);

const REFRESH_BUFFER_MS = 2 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mfaPending, setMfaPending] = useState(null);
    const refreshTimerRef = useRef(null);

    const clearSession = useCallback(() => {
        clearAuthStorage();
        setUser(null);
        setMfaPending(null);
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    const clearMfaPending = useCallback(() => {
        setMfaPending(null);
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

    const completeAuthenticatedSession = useCallback(async (tokenData, normalizedEmail, options = {}) => {
        const { access_token, refresh_token, expires_in, username, role, email } = tokenData;
        storeAuthTokens({ access_token, refresh_token, expires_in });

        const meResult = await getMe(options);
        const profile = meResult.success ? meResult.data : {};
        const userData = {
            username: profile.username || username,
            email: profile.email || email || normalizedEmail,
            role: profile.role || role || "client",
            email_verified: profile.email_verified === true,
            verification_deadline: profile.verification_deadline,
            mfa_enabled: profile.mfa_enabled === true,
        };

        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        sessionStorage.setItem("dietdesk_login_success", `Welcome, ${userData.username || userData.email}. Login successful.`);
        setUser(userData);
        setMfaPending(null);
        scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
        return userData;
    }, [scheduleTokenRefresh]);

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
                    getMe({ onWaking: () => window.dispatchEvent(new Event("dietdesk:backend-waking")) }),
                    new Promise((resolve) => {
                        setTimeout(() => resolve({ success: false, error: "Session check timed out", coldStart: true }), 45000);
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
                        mfa_enabled: meResult.data.mfa_enabled ?? parsedUser.mfa_enabled ?? false,
                    };
                    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
                    setUser(normalizedUser);
                    scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
                } else if (meResult.coldStart) {
                    setUser(parsedUser);
                    scheduleTokenRefresh(Number(localStorage.getItem(TOKEN_EXPIRES_KEY)));
                    getMe({ onWaking: () => window.dispatchEvent(new Event("dietdesk:backend-waking")) }).then((retry) => {
                        if (cancelled || !retry.success) return;
                        const normalizedUser = {
                            username: retry.data.username || parsedUser.username,
                            email: retry.data.email || parsedUser.email,
                            role: retry.data.role || parsedUser.role || "client",
                            email_verified: retry.data.email_verified ?? false,
                            verification_deadline: retry.data.verification_deadline,
                            mfa_enabled: retry.data.mfa_enabled ?? parsedUser.mfa_enabled ?? false,
                        };
                        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
                        setUser(normalizedUser);
                    });
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

    const login = async (email, password, options = {}) => {
        const normalizedEmail = normalizeEmail(email);
        const result = await loginUser({ email: normalizedEmail, password }, options);
        if (!result.success) {
            return { success: false, error: result.error || "Login failed" };
        }

        if (result.data?.mfa_required) {
            setMfaPending({
                email: normalizedEmail,
                temp_token: result.data.temp_token,
            });
            return { success: true, mfaRequired: true };
        }

        const userData = await completeAuthenticatedSession(result.data, normalizedEmail, options);
        return { success: true, user: userData };
    };

    const verifyMfaLogin = async (code, options = {}) => {
        if (!mfaPending?.email || !mfaPending?.temp_token) {
            return { success: false, error: "MFA session expired. Please sign in again." };
        }

        const result = await verifyMfaLoginApi({
            email: mfaPending.email,
            temp_token: mfaPending.temp_token,
            code,
        });

        if (!result.success) {
            return { success: false, error: result.error || "Invalid code. Try again." };
        }

        const userData = await completeAuthenticatedSession(result.data, mfaPending.email, options);
        return { success: true, user: userData };
    };

    const updateMfaStatus = useCallback((enabled) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, mfa_enabled: enabled };
            localStorage.setItem(USER_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const register = async (username, email, password, options = {}) => {
        const normalizedEmail = normalizeEmail(email);
        const result = await registerUser({
            username,
            email: normalizedEmail,
            password,
            role: "dietitian",
        }, options);
        if (!result.success) {
            return { success: false, error: result.error || "Registration failed" };
        }

        const loginResult = await loginUser({ email: normalizedEmail, password }, options);
        if (loginResult.success && !loginResult.data?.mfa_required) {
            const userData = await completeAuthenticatedSession(loginResult.data, normalizedEmail, options);
            return {
                success: true,
                emailSent: result.data?.email_sent !== false,
                autoLoggedIn: true,
                user: userData,
            };
        }

        return {
            success: true,
            emailSent: result.data?.email_sent !== false,
            autoLoggedIn: false,
        };
    };

    const logout = async () => {
        await logoutUser();
        clearSession();
    };

    const value = {
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        register,
        loading,
        mfaPending,
        verifyMfaLogin,
        clearMfaPending,
        updateMfaStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
