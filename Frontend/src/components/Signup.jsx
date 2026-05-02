import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Signup = ({ onToggle }) => {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        const result = await register(username, email, password, role);
        if (result.success) {
            setSuccess("Account created. You can use Diet Desk now, but please verify your email within 2 days.");
        } else {
            setError(result.error || 'Signup failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="fade-up" style={{ padding: '20px', width: '100%', maxWidth: '440px' }}>
            <div className="dd-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 48, height: 48,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: 800, color: 'white',
                        margin: '0 auto 16px',
                        boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
                    }}>D</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Create account</h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '8px' }}>Join our clinical network today</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <label className="form-label">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-select"
                        >
                            <option value="client">Client / Patient</option>
                            <option value="dietitian">Dietitian / Professional</option>
                        </select>
                    </div>
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
                            placeholder="you@example.com"
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
                            padding: '12px', background: '#ecfdf5', border: '1px solid #d1fae5', 
                            borderRadius: '8px', color: '#059669', fontSize: '0.8125rem', textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', marginTop: '8px' }}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
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
