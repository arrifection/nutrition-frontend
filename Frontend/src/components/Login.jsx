import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = ({ onToggle }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'Login failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="fade-up" style={{ padding: '20px', width: '100%', maxWidth: '440px' }}>
            <div className="dd-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 48, height: 48,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: 800, color: 'white',
                        margin: '0 auto 16px',
                        boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
                    }}>D</div>
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

                    <button
                        type="submit"
                        disabled={loading}
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
