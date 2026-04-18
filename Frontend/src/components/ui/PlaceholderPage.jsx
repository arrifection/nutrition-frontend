import React from 'react';
import { Layout } from 'lucide-react';

const T = {
    heading: { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: '#64748b' },
};

export default function PlaceholderPage({ title, description, icon: Icon = Layout }) {
    return (
        <div className="fade-up" style={{ padding: '32px 28px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ 
                margin: '80px auto 24px', 
                width: '64px', height: '64px', 
                background: '#f1f5f9', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8'
            }}>
                <Icon size={32} />
            </div>
            <h1 style={T.heading}>{title}</h1>
            <p style={{ ...T.subheading, marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
                {description || "This section is currently under development to provide the best clinical experience."}
            </p>
            <div style={{ marginTop: '32px' }}>
                <button className="btn-secondary" onClick={() => window.history.back()}>Go Back</button>
            </div>
        </div>
    );
}
