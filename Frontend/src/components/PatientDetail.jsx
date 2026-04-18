import { useState } from "react";
import {
    User,
    History as HistoryIcon,
    ClipboardList,
    TrendingUp,
    AlertCircle,
    Plus,
    ArrowLeft,
    FileText,
    Calendar,
    Target,
    Activity,
    MessageCircle,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import GoalManager from "./GoalManager";
import ReflectionLog from "./ReflectionLog";
import ConsistencyPulse from "./ConsistencyPulse";

const T = {
    heading: { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.8125rem', fontWeight: 400, color: '#64748b' },
    sectionTitle: { fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' },
    label: { fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' },
    value: { fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }
};

export default function PatientDetail({ patient, onBack, onEditPlan }) {
    const [activeTab, setActiveTab] = useState("overview");

    const history = {
        plans: [
            { id: 1, date: "2024-01-10", name: "High Protein / Low Carb Version 1", status: "Completed" },
            { id: 2, date: "2023-11-15", name: "Maintenance Plan", status: "Archived" }
        ],
        followUps: [
            { date: "2024-01-28", weight: "64.2kg", note: "Adherence is good, feeling more energetic.", type: "In-person" },
            { date: "2024-01-14", weight: "65.5kg", note: "Adjusting to new calorie deficit.", type: "Remote" }
        ],
        notes: [
            { id: 1, date: "2024-01-28", author: "Dr. Sarah", text: "Patient reported slight hunger in evenings. Added 10g protein to dinner snack." },
            { id: 2, date: "2024-01-10", author: "Dr. Sarah", text: "Initial assessment. Patient motivated. No clinical red flags." }
        ]
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "goals", label: "Goals", icon: Target },
        { id: "reflections", label: "Journal", icon: MessageCircle },
        { id: "plans", label: "Plans", icon: FileText },
        { id: "history", label: "History", icon: HistoryIcon },
    ];

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={onBack}
                        style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            background: '#ffffff', border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748b', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={T.heading}>{patient.name}</h1>
                        <p style={T.subheading}>Patient ID: #P-{patient.id || '00' + patient.name.length} • Registered Jan 2024</p>
                    </div>
                </div>
                <button onClick={() => onEditPlan(patient)} className="btn-primary">
                    <Plus size={16} strokeWidth={2.5} />
                    Update Plan
                </button>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Status</div>
                    <div style={{ marginTop: '4px' }}>
                        <span className="badge-active">On Track</span>
                    </div>
                </div>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Demographics</div>
                    <div style={{ ...T.value, marginTop: '4px' }}>{patient.age}y • {patient.gender}</div>
                </div>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Vitals</div>
                    <div style={{ ...T.value, marginTop: '4px' }}>{patient.height}cm • {patient.weight}kg</div>
                </div>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Metabolic BMI</div>
                    <div style={{ ...T.value, marginTop: '4px', color: '#16a34a' }}>{patient.bmi || '23.4'} (Normal)</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', paddingBottom: '2px' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 16px', border: 'none', background: 'transparent',
                                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                                color: active ? '#16a34a' : '#64748b',
                                borderBottom: active ? '2px solid #16a34a' : '2px solid transparent',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '400px' }}>
                {activeTab === "overview" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <Activity size={18} style={{ color: '#16a34a' }} />
                                    <h3 style={T.sectionTitle}>Current Assessment</h3>
                                </div>
                                <div style={{ 
                                    padding: '16px', background: '#f0fdf4', borderRadius: '10px', 
                                    borderLeft: '4px solid #16a34a', marginBottom: '20px' 
                                }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#14532d', fontStyle: 'italic', lineHeight: 1.5 }}>
                                        "Patient is showing consistent progress with protein targets. Next phase will focus on metabolic flexibility and evening habit stack."
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={T.label}>Activity</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px' }}>{patient.activity_level}</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={T.label}>Prime Goal</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px' }}>{patient.goal}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                                    <h3 style={T.sectionTitle}>Clinical Background</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
                                    <div><span style={{ fontWeight: 700, color: '#475569' }}>Medical:</span> {patient.medical_notes || "No previous records."}</div>
                                    <div><span style={{ fontWeight: 700, color: '#475569' }}>Allergies:</span> None reported.</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <TrendingUp size={18} style={{ color: '#16a34a' }} />
                                    <h3 style={T.sectionTitle}>Weight Trend (30d)</h3>
                                </div>
                                <div style={{ height: '100px', display: 'flex', alignItems: 'end', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                    {[66.2, 65.8, 65.5, 65.2, 64.8, 64.5, 64.2].map((w, i) => (
                                        <div key={i} style={{ 
                                            flex: 1, background: '#dcfce7', borderRadius: '4px 4px 0 0',
                                            height: `${(w - 60) * 12}%`, transition: 'background 0.2s',
                                            cursor: 'pointer'
                                        }} 
                                        onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#dcfce7'}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: '#94a3b8', marginTop: '8px', fontWeight: 600 }}>
                                    <span>JAN 01</span>
                                    <span>TODAY</span>
                                </div>
                            </div>

                            <div className="dd-card" style={{ padding: '24px' }}>
                                <ConsistencyPulse role="dietitian" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "goals" && <div className="dd-card" style={{ padding: '24px' }}><GoalManager /></div>}

                {activeTab === "reflections" && (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <ReflectionLog role="dietitian" patientId={patient.id} />
                    </div>
                )}

                {activeTab === "plans" && (
                    <div className="dd-card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '12px 20px', ...T.label }}>Date</th>
                                    <th style={{ padding: '12px 20px', ...T.label }}>Plan Name</th>
                                    <th style={{ padding: '12px 20px', ...T.label }}>Status</th>
                                    <th style={{ padding: '12px 20px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.plans.map((p, idx) => (
                                    <tr key={p.id} style={{ borderBottom: idx < history.plans.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                        <td style={{ padding: '14px 20px', fontSize: '0.8125rem', color: '#64748b' }}>{p.date}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ 
                                                fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                                                background: p.status === 'Completed' ? '#dcfce7' : '#f1f5f9',
                                                color: p.status === 'Completed' ? '#15803d' : '#64748b'
                                            }}>{p.status}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                            <button className="btn-text" style={{ fontSize: '0.75rem' }}>
                                                View PDF <ExternalLink size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "history" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <ClipboardList size={18} style={{ color: '#16a34a' }} />
                                <h3 style={T.sectionTitle}>Follow-up Log</h3>
                            </div>
                            {history.followUps.map((f, i) => (
                                <div key={i} className="dd-card" style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>{f.date}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f.type}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>Weight: {f.weight}</div>
                                    <p style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>"{f.note}"</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <FileText size={18} style={{ color: '#16a34a' }} />
                                <h3 style={T.sectionTitle}>Clinical Notes</h3>
                            </div>
                            {history.notes.map(note => (
                                <div key={note.id} style={{ padding: '16px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e' }}>{note.date}</span>
                                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b45309' }}>{note.author}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.5 }}>{note.text}</p>
                                </div>
                            ))}
                            <button className="btn-secondary" style={{ borderStyle: 'dashed', background: '#ffffff', color: '#16a34a', fontSize: '0.75rem' }}>
                                + Add New Clinical Note
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
