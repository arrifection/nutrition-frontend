import React, { useState } from 'react';
import { 
    User, 
    Bell, 
    Shield, 
    Moon, 
    Sun, 
    Grid, 
    Mail, 
    Building2,
    Save
} from 'lucide-react';

const T = {
    heading: { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: '#64748b' },
    sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#0f172a' },
    label: { fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }
};

const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
};

export default function Settings() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="fade-up" style={{ padding: '32px 28px', maxWidth: '1000px', margin: '0 auto' }}>
            {saved && (
                <div style={{ 
                    position: 'fixed', top: 20, right: 20, background: '#16a34a', color: 'white', 
                    padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000, fontWeight: 600
                }} className="fade-in">
                    Settings saved successfully!
                </div>
            )}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={T.heading}>Settings</h1>
                <p style={T.subheading}>Manage your account preferences and clinical workspace.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Profile Section */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#64748b' }}>
                            <User size={20} />
                        </div>
                        <h2 style={T.sectionTitle}>Profile Information</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={T.label}>Full Name</label>
                            <input className="input-premium" type="text" defaultValue="Dr. Sarah Mitchell" />
                        </div>
                        <div>
                            <label style={T.label}>Email Address</label>
                            <input className="input-premium" type="email" defaultValue="sarah.mitchell@dietdesk.com" />
                        </div>
                        <div>
                            <label style={T.label}>Specialization</label>
                            <input className="input-premium" type="text" defaultValue="Clinical Nutritionist" />
                        </div>
                    </div>
                </div>

                {/* Clinic Section */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#64748b' }}>
                            <Building2 size={20} />
                        </div>
                        <h2 style={T.sectionTitle}>Clinic Details</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={T.label}>Clinic Name</label>
                            <input className="input-premium" type="text" defaultValue="Mitchell Clinical Health" />
                        </div>
                        <div>
                            <label style={T.label}>Address</label>
                            <input className="input-premium" type="text" defaultValue="123 Wellness Ave, Suite 400" />
                        </div>
                        <div>
                            <label style={T.label}>License Number</label>
                            <input className="input-premium" type="text" defaultValue="RD-884210-SA" />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#64748b' }}>
                            <Grid size={20} />
                        </div>
                        <h2 style={T.sectionTitle}>Preferences</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Theme Mode</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Toggle between light and dark</div>
                            </div>
                            <button 
                                onClick={() => setDarkMode(!darkMode)}
                                style={{ 
                                    border: 'none', background: '#f1f5f9', padding: '8px', 
                                    borderRadius: '8px', cursor: 'pointer', color: '#475569',
                                    display: 'flex', gap: '8px', alignItems: 'center'
                                }}
                            >
                                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{darkMode ? 'Dark' : 'Light'}</span>
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Notifications</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Receive patient updates</div>
                            </div>
                            <div 
                                onClick={() => setNotifications(!notifications)}
                                style={{ 
                                    width: '36px', height: '20px', background: notifications ? '#16a34a' : '#cbd5e1',
                                    borderRadius: '20px', cursor: 'pointer', position: 'relative',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ 
                                    width: '14px', height: '14px', background: 'white', 
                                    borderRadius: '50%', position: 'absolute', top: '3px',
                                    left: notifications ? '19px' : '3px', transition: 'left 0.2s'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#64748b' }}>
                            <Shield size={20} />
                        </div>
                        <h2 style={T.sectionTitle}>Security</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button className="btn-secondary" style={{ justifyContent: 'center' }}>Change Password</button>
                        <button className="btn-secondary" style={{ justifyContent: 'center' }}>Enable Two-Factor Auth</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
                </button>
            </div>
        </div>
    );
}
