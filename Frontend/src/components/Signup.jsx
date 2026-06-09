import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { wakeBackend } from "../services/api";

const Signup = ({ onToggle }) => {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        wakeBackend();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        const result = await register(username, email, password);
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
                            className="input-premium"
                            placeholder="••••••••"
                        />
                    </div>

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
                        disabled={loading}
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
