import { useState, useEffect } from "react";
import {
    Plus,
    Users,
    FileText,
    TrendingUp,
    Bell,
    CheckCircle2,
    Clock,
    ChevronRight,
    ArrowUpRight,
} from "lucide-react";
import { getPatients } from "../services/api";
import { useAuth } from "../context/AuthContext";

const T = {
    label: { fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' },
    heading: { fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 },
    subheading: { fontSize: '0.8125rem', fontWeight: 400, color: '#64748b' },
    sectionTitle: { fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.01em' },
    body: { fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' },
    bodyMuted: { fontSize: '0.8125rem', fontWeight: 400, color: '#64748b' },
    stat: { fontSize: '1.625rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 },
};

const card = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const STAT_CONFIG = [
    { label: "Total Patients", icon: Users,      iconBg: '#eff6ff', iconColor: '#3b82f6' },
    { label: "Active Plans",   icon: FileText,    iconBg: '#f0fdf4', iconColor: '#16a34a' },
    { label: "Engagement",     icon: TrendingUp,  iconBg: '#faf5ff', iconColor: '#9333ea' },
    { label: "Alerts",         icon: Bell,        iconBg: '#fffbeb', iconColor: '#d97706' },
];

const TASKS = [
    { id: 1, title: "Review Maria's meal logs",      time: "2h ago",  priority: "high" },
    { id: 2, title: "Initial assessment: David S.",  time: "4h ago",  priority: "medium" },
    { id: 3, title: "Update macro targets for John", time: "Today",   priority: "low" },
];

const PRIORITY_DOT = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

export default function Dashboard({ onCreatePlan, onSelectClient }) {
    const { user } = useAuth();
    const role = user?.role || "client";
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(role === "dietitian");

    useEffect(() => {
        if (role !== "dietitian") { setLoadingPatients(false); return; }
        getPatients().then(res => {
            if (res.success && Array.isArray(res.data)) setPatients(res.data);
            setLoadingPatients(false);
        });
    }, [role]);

    const statsValues = [patients.length, "24", "88%", "5"];

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    if (role !== "dietitian") {
        return (
            <div className="fade-up" style={{ padding: '32px 28px' }}>
                <h2 style={T.heading}>Welcome, {user?.username}!</h2>
                <p style={{ ...T.subheading, marginTop: 6 }}>Your client dashboard is being prepared.</p>
            </div>
        );
    }

    return (
        <div className="fade-up" style={{ padding: '28px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={T.heading}>
                        Good morning, {user?.username || 'Clinician'} 👋
                    </h1>
                    <p style={{ ...T.subheading, marginTop: 4 }}>{today}</p>
                </div>
                <button
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 38, height: 38,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        color: '#64748b',
                        position: 'relative',
                        transition: 'border-color 0.15s ease',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                    <Bell size={16} strokeWidth={1.8} />
                    <span style={{
                        position: 'absolute', top: 7, right: 7,
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#ef4444', border: '2px solid white'
                    }} />
                </button>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
                {STAT_CONFIG.map((cfg, i) => {
                    const Icon = cfg.icon;
                    return (
                        <div key={i} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.2s ease' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
                        >
                            <div style={{
                                width: 42, height: 42, borderRadius: '10px',
                                background: cfg.iconBg, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={20} style={{ color: cfg.iconColor }} strokeWidth={1.8} />
                            </div>
                            <div>
                                <div style={T.label}>{cfg.label}</div>
                                <div style={{ ...T.stat, marginTop: 2 }}>{statsValues[i]}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── CTA Banner ── */}
            <div style={{
                ...card,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle glow */}
                <div style={{
                    position: 'absolute', right: -60, top: -60,
                    width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', marginBottom: 4 }}>
                        Create a New Nutrition Plan
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
                        Build a personalized protocol for your patient in minutes.
                    </div>
                </div>
                <button
                    onClick={onCreatePlan}
                    className="btn-primary"
                    style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Create New Plan
                </button>
            </div>

            {/* ── Patients + Tasks ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: 16, alignItems: 'start' }}
                className="responsive-grid-collapse">
                
                {/* Recent Patients */}
                <div style={card}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '1px solid #f1f5f9',
                    }}>
                        <span style={T.sectionTitle}>Recent Patients</span>
                        <button className="btn-text" style={{ padding: '4px 8px' }}>
                            View All <ArrowUpRight size={13} />
                        </button>
                    </div>
                    <div>
                        {loadingPatients ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                                Loading patient data…
                            </div>
                        ) : patients.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                                No patient records yet.
                            </div>
                        ) : patients.slice(0, 6).map((client, idx) => (
                            <button
                                key={client.id}
                                onClick={() => onSelectClient(client)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '13px 20px',
                                    borderTop: idx > 0 ? '1px solid #f8fafc' : 'none',
                                    border: 'none', cursor: 'pointer',
                                    background: 'transparent', textAlign: 'left',
                                    transition: 'background 0.12s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.875rem', fontWeight: 700, color: '#15803d',
                                    flexShrink: 0,
                                }}>
                                    {client.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ ...T.body, fontSize: '0.875rem' }}>{client.name}</div>
                                    <div style={{ ...T.bodyMuted, fontSize: '0.75rem', marginTop: 1 }}>
                                        {client.goal} · {client.age}y
                                    </div>
                                </div>
                                <span className="badge-active">Active</span>
                                <ChevronRight size={15} style={{ color: '#cbd5e1', flexShrink: 0 }} strokeWidth={1.8} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Tasks */}
                <div style={card}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={T.sectionTitle}>Priority Tasks</span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {TASKS.map(task => (
                            <div key={task.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{ marginTop: 5, flexShrink: 0 }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: '50%',
                                        background: PRIORITY_DOT[task.priority],
                                        boxShadow: `0 0 0 3px ${PRIORITY_DOT[task.priority]}20`,
                                    }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1e293b', lineHeight: 1.4 }}>
                                        {task.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                                        <Clock size={11} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>{task.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Achievement notice */}
                        <div style={{
                            marginTop: 6,
                            padding: '12px 14px',
                            background: '#f0fdf4',
                            border: '1px solid #dcfce7',
                            borderRadius: '9px',
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} strokeWidth={2} />
                            <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#14532d' }}>Great work today!</div>
                                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: 1, fontWeight: 400 }}>5 plans finalized this session.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
