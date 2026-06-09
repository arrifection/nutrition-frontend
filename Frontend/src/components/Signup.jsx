import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { wakeBackend } from "../services/api";
import { isPasswordStrong, passwordRequirements, passwordValidationMessage } from "../utils/passwordPolicy";

const Signup = ({ onToggle }) => {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [waking, setWaking] = useState(false);

    useEffect(() => {
        wakeBackend();
    }, []);

    const requirements = useMemo(() => passwordRequirements(password), [password]);
    const passwordReady = isPasswordStrong(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const passwordError = passwordValidationMessage(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);
        setWaking(false);
        const result = await register(username, email, password, {
            onWaking: () => setWaking(true),
        });
        if (result.success) {
            if (result.emailSent === false) {
                setSuccess(
                    "Account created. We couldn't send the verification email right now — open Settings after login and tap Resend Verification Email."
                );
            } else {
                setSuccess(
                    "Account created! Check your inbox for a verification link. Please verify within 2 days."
                );
            }
        } else {
            setError(result.error || "We couldn't create your account right now. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="fade-up auth-page" style={{ padding: "20px", width: "100%", maxWidth: "440px" }}>
            <div className="dd-card auth-card" style={{ padding: "40px" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                        Create account
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "8px" }}>
                        Dietitian workspace — manage patients and build plans
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div>
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="input-premium"
                            placeholder="johndoe"
                        />
                    </div>
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
                            minLength={10}
                            autoComplete="new-password"
                            className="input-premium"
                            placeholder="Min. 10 chars with mixed case, number, symbol"
                        />
                        {password && (
                            <ul className="password-requirements" aria-live="polite">
                                {requirements.map((req) => (
                                    <li key={req.key} className={req.met ? "met" : ""}>
                                        {req.met ? "✓" : "○"} {req.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {waking && (
                        <div
                            style={{
                                padding: "10px",
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                borderRadius: "8px",
                                color: "#1d4ed8",
                                fontSize: "0.8125rem",
                                textAlign: "center",
                            }}
                        >
                            Backend is waking up... Trying again in a few seconds.
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                padding: "10px",
                                background: "#fef2f2",
                                border: "1px solid #fee2e2",
                                borderRadius: "8px",
                                color: "#b91c1c",
                                fontSize: "0.8125rem",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            style={{
                                padding: "12px",
                                background: "#ecfdf5",
                                border: "1px solid #d1fae5",
                                borderRadius: "8px",
                                color: "#059669",
                                fontSize: "0.8125rem",
                                textAlign: "center",
                                lineHeight: "1.4",
                            }}
                        >
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !passwordReady}
                        className="btn-primary"
                        style={{ width: "100%", padding: "12px", marginTop: "8px" }}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div style={{ marginTop: "28px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Already have an account?{" "}
                        <button onClick={onToggle} className="btn-text">
                            Sign in instead
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
