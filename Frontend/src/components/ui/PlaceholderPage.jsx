import React from 'react';
import { Layout } from 'lucide-react';

const T = {
    heading: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' },
};

export default function PlaceholderPage({ title, description, icon: Icon = Layout }) {
    return (
        <div className="fade-up" style={{ padding: '32px 28px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ 
                margin: '80px auto 24px', 
                width: '64px', height: '64px', 
                background: 'var(--surface)', borderRadius: '16px',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)'
            }}>
                <Icon size={32} />
            </div>
            <h1 style={T.heading}>{title}</h1>
            <p style={{ ...T.subheading, marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
                {description || "This section is currently under development to provide the best clinical experience."}
            </p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <span className="coming-soon-pill">Coming Soon</span>
            </div>
        </div>
    );
}
