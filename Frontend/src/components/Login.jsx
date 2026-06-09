import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { requestVerificationEmail, wakeBackend } from "../services/api";

const isVerificationBlockedError = (message = "") => {
    const lower = message.toLowerCase();
    return lower.includes("verification window has ended")
        || lower.includes("verification period has ended")
        || lower.includes("resend verification email");
};

const Login = ({ onToggle, onSuccess }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [showResendOption, setShowResendOption] = useState(false);

    useEffect(() => {
        wakeBackend();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setShowResendOption(false);
        setLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            const err = result.error || "We couldn't sign you in right now. Please check your details and try again.";
            setError(err);
            setShowResendOption(isVerificationBlockedError(err));
            setLoading(false);
            return;
        }
        onSuccess?.();
        setLoading(false);
    };

    const handleResendVerification = async () => {
        if (!email || !password) {
            setError("Enter your email and password, then resend the verification email.");
            return;
        }

        setError("");
        setSuccess("");
        setResendLoading(true);

        const result = await requestVerificationEmail({
            email: email.trim().toLowerCase(),
            password,
        });

        setResendLoading(false);

        if (!result.success) {
            setError(result.error || "We couldn't send the verification email right now. Please try again in a few minutes.");
            return;
        }

        setSuccess(result.data?.message || "Verification email sent. Check your inbox and verify within 2 days.");
        setShowResendOption(false);
    };

    return (
        <div className="fade-up auth-page" style={{ padding: '20px', width: '100%', maxWidth: '440px' }}>
            <div className="dd-card auth-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Welcome back</h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '8px' }}>Login to your clinical dashboard</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-premium"
                            placeholder="you@clinic.com"
                        />
                    </div>
                    <div>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-premium"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2',
                            borderRadius: '8px', color: '#b91c1c', fontSize: '0.8125rem', textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '10px', background: '#ecfdf5', border: '1px solid #bbf7d0',
                            borderRadius: '8px', color: '#047857', fontSize: '0.8125rem', textAlign: 'center'
                        }}>
                            {success}
                        </div>
                    )}

                    {showResendOption && (
                        <div style={{
                            padding: '14px',
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                        }}>
                            <p style={{ fontSize: '0.8125rem', color: '#9a3412', textAlign: 'center', lineHeight: 1.5 }}>
                                Your account exists but email is not verified. We can send a new verification link and give you 2 more days.
                            </p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resendLoading || loading}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: '#ea580c',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                <Mail size={16} />
                                {resendLoading ? "Sending..." : "Resend Verification Email"}
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || resendLoading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', marginTop: '8px' }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        New to DietDesk?{" "}
                        <button onClick={onToggle} className="btn-text">
                            Create an account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
