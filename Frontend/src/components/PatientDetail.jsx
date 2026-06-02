import { useEffect, useMemo, useState } from "react";
import {
    User,
    History as HistoryIcon,
    TrendingUp,
    AlertCircle,
    Plus,
    ArrowLeft,
    FileText,
    Target,
    Activity,
    MessageCircle,
} from "lucide-react";
import { deletePlanHistoryItem, getLogs, getPlan, getPlanHistory } from "../services/api";

const T = {
    heading: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' },
    sectionTitle: { fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' },
    label: { fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' },
    value: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") return "Not recorded";
    return `${value}${suffix}`;
};

const getFoodCalories = (food) => Number(food?.macros?.calories ?? food?.calories ?? 0) || 0;

const formatShortPatientId = (patient) => {
    if (!patient?.id) return "PT-PENDING";
    const suffix = String(patient.id).replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
    return `PT-${suffix || "PENDING"}`;
};

const formatDisplayDate = (value) => {
    if (!value) return "Date not recorded";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date not recorded";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).replace(",", "");
};

const getPlanStats = (plan) => {
    const days = plan?.days || {};
    let totalItems = 0;
    let totalCalories = 0;
    let daysWithMeals = 0;

    DAY_NAMES.forEach((day) => {
        const meals = days[day] || {};
        const items = Object.values(meals).flat().filter(Boolean);
        if (items.length > 0) {
            daysWithMeals += 1;
            totalItems += items.length;
            totalCalories += items.reduce((sum, food) => sum + getFoodCalories(food), 0);
        }
    });

    return {
        hasPlan: totalItems > 0,
        totalItems,
        daysWithMeals,
        totalCalories,
        avgCalories: daysWithMeals ? Math.round(totalCalories / daysWithMeals) : null,
    };
};

const normalizeDateKey = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
};

const getLogDateKey = (log) => normalizeDateKey(log.created_at || log.date);

const getLast28Days = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 28 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (27 - index));
        return {
            key: date.toISOString().slice(0, 10),
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    });
};

const extractWeightHistory = (patient) => {
    const possibleSources = [
        patient?.weight_history,
        patient?.weightHistory,
        patient?.progress_records,
        patient?.progressRecords,
        patient?.follow_ups,
        patient?.followUps,
        patient?.measurements,
    ];

    return possibleSources
        .filter(Array.isArray)
        .flat()
        .map((entry, index) => {
            const weight = Number(entry?.weight ?? entry?.weight_kg ?? entry?.weightKg ?? entry?.value);
            const date = entry?.date || entry?.created_at || entry?.createdAt || entry?.recorded_at || entry?.recordedAt;
            return {
                id: entry?.id || `${date || 'weight'}-${index}`,
                weight,
                date,
                label: date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Record ${index + 1}`,
            };
        })
        .filter((entry) => Number.isFinite(entry.weight))
        .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
};

const getClinicalRows = (patient) => [
    { label: "Medical history", value: patient?.medical_notes },
    { label: "Allergies", value: patient?.allergies },
    { label: "Dietary restrictions", value: patient?.dietary_restrictions },
    { label: "Medications", value: patient?.medications },
    { label: "Diagnosis", value: patient?.diagnosis },
    { label: "Labs", value: patient?.labs },
].filter((row) => row.value);

function EmptyChartState({ children }) {
    return (
        <div className="chart-empty-state">
            <p>{children}</p>
        </div>
    );
}

function MetricTile({ label, value, accent = false }) {
    return (
        <div className="metric-tile">
            <div style={T.label}>{label}</div>
            <div style={{ ...T.value, marginTop: '4px', color: accent ? 'var(--brand-green)' : 'var(--text-primary)' }}>
                {value}
            </div>
        </div>
    );
}

function ComingSoonPanel({ title, description }) {
    return (
        <div className="dd-card" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ ...T.label, color: 'var(--brand-green)' }}>Coming soon</div>
            <h3 style={{ ...T.sectionTitle, marginTop: '8px' }}>{title}</h3>
            <p style={{ ...T.subheading, maxWidth: '520px', margin: '10px auto 0', lineHeight: 1.6 }}>
                {description}
            </p>
        </div>
    );
}

function PlanSummaryCard({ title, planItem, stats, active = false, onView, onDelete }) {
    return (
        <div className="dd-card" style={{ padding: '18px', borderColor: active ? 'var(--brand-green)' : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                    <div style={T.label}>{active ? "Active Plan" : "Previous Plan"}</div>
                    <h4 style={{ ...T.sectionTitle, marginTop: '6px' }}>{title}</h4>
                    <p style={{ ...T.subheading, margin: '6px 0 0' }}>
                        Saved {formatDisplayDate(planItem?.saved_at)}
                    </p>
                </div>
                <span className={active ? "badge-active" : "status-pill"}>
                    {active ? "Current" : "Previous"}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }} className="plan-summary-metrics">
                <MetricTile label="Days" value={`${stats.daysWithMeals}/7`} accent={active} />
                <MetricTile label="Items" value={stats.totalItems} />
                <MetricTile label="Avg kcal" value={stats.avgCalories ? `${stats.avgCalories}` : "-"} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button className="btn-secondary" type="button" onClick={onView}>View</button>
                <button
                    className="btn-secondary"
                    type="button"
                    onClick={onDelete}
                    style={{ color: '#b91c1c', borderColor: '#fecaca', background: '#fff' }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

function PlanDayTable({ planItem }) {
    if (!planItem) {
        return <EmptyChartState>Select a plan to view details.</EmptyChartState>;
    }

    return (
        <div className="table-wrapper dd-table-scroll overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 20px', ...T.label }}>Day</th>
                        <th style={{ padding: '12px 20px', ...T.label }}>Items</th>
                        <th style={{ padding: '12px 20px', ...T.label }}>Calories</th>
                    </tr>
                </thead>
                <tbody>
                    {DAY_NAMES.map((day) => {
                        const meals = planItem?.days?.[day] || {};
                        const items = Object.values(meals).flat().filter(Boolean);
                        const calories = items.reduce((sum, food) => sum + getFoodCalories(food), 0);
                        return (
                            <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '14px 20px', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{day}</td>
                                <td style={{ padding: '14px 20px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{items.length}</td>
                                <td style={{ padding: '14px 20px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{items.length ? `${Math.round(calories)} kcal` : "Not planned"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function WeightTrendChart({ points }) {
    if (!points.length) {
        return (
            <EmptyChartState>
                No weight trend yet. Add follow-up weight records to track progress.
            </EmptyChartState>
        );
    }

    const min = Math.min(...points.map((point) => point.weight));
    const max = Math.max(...points.map((point) => point.weight));
    const range = Math.max(max - min, 1);

    return (
        <div>
            <div className="trend-chart" aria-label="Weight trend chart">
                {points.map((point) => {
                    const height = 24 + ((point.weight - min) / range) * 72;
                    return (
                        <div key={point.id} className="trend-column" title={`${point.label}: ${point.weight}kg`}>
                            <div className="trend-value">{point.weight}kg</div>
                            <div className="trend-bar" style={{ height: `${height}%` }} />
                            <div className="trend-label">{point.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ConsistencyHeatmap({ logs }) {
    if (!logs.length) {
        return (
            <EmptyChartState>
                No consistency data yet. Daily check-ins will appear here.
            </EmptyChartState>
        );
    }

    const days = getLast28Days();
    const counts = logs.reduce((acc, log) => {
        const key = getLogDateKey(log);
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const max = Math.max(1, ...Object.values(counts));

    return (
        <div>
            <div className="heatmap-grid" aria-label="Consistency heatmap">
                {days.map((day) => {
                    const count = counts[day.key] || 0;
                    const level = count === 0 ? 0 : Math.max(1, Math.ceil((count / max) * 3));
                    return (
                        <div
                            key={day.key}
                            className={`heatmap-cell heatmap-level-${level}`}
                            title={`${day.label}: ${count} check-in${count === 1 ? "" : "s"}`}
                        />
                    );
                })}
            </div>
            <div className="chart-meta-row">
                <span>Last 28 days</span>
                <span>{logs.length} journal/check-in entries</span>
            </div>
        </div>
    );
}

export default function PatientDetail({ patient, onBack, onEditPlan }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [plan, setPlan] = useState(null);
    const [planHistory, setPlanHistory] = useState([]);
    const [viewingPlanId, setViewingPlanId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loadingPlan, setLoadingPlan] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadPatientContext = async () => {
            if (!patient?.id) return;
            setLoadingPlan(true);
            const [planResponse, historyResponse, logsResponse] = await Promise.all([
                getPlan(patient.id),
                getPlanHistory(patient.id),
                getLogs(patient.id),
            ]);

            if (cancelled) return;
            if (planResponse.success) setPlan(planResponse.data);
            else setPlan(null);
            if (historyResponse.success && Array.isArray(historyResponse.data?.plans)) {
                setPlanHistory(historyResponse.data.plans);
                const current = historyResponse.data.plans.find((item) => item.is_current) || historyResponse.data.plans[0];
                setViewingPlanId(current?.id || null);
            } else {
                setPlanHistory([]);
                setViewingPlanId(null);
            }
            if (logsResponse.success && Array.isArray(logsResponse.data)) setLogs(logsResponse.data);
            else setLogs([]);
            setLoadingPlan(false);
        };

        loadPatientContext();
        return () => {
            cancelled = true;
        };
    }, [patient?.id]);

    const planStats = useMemo(() => getPlanStats(plan), [plan]);
    const activePlan = useMemo(() => planHistory.find((item) => item.is_current) || planHistory[0] || null, [planHistory]);
    const previousPlans = useMemo(() => planHistory.filter((item) => item.id !== activePlan?.id), [planHistory, activePlan]);
    const viewingPlan = useMemo(() => planHistory.find((item) => item.id === viewingPlanId) || activePlan, [planHistory, viewingPlanId, activePlan]);
    const viewingPlanStats = useMemo(() => getPlanStats(viewingPlan), [viewingPlan]);
    const weightHistory = useMemo(() => extractWeightHistory(patient), [patient]);
    const clinicalRows = useMemo(() => getClinicalRows(patient), [patient]);

    const handleDeletePlan = async (planItem) => {
        if (!planItem?.id || !patient?.id) return;
        const confirmed = window.confirm(`Do you want to delete the plan saved on ${formatDisplayDate(planItem.saved_at)}?`);
        if (!confirmed) return;

        const response = await deletePlanHistoryItem(patient.id, planItem.id);
        if (!response.success) {
            alert(response.error || "Could not delete plan.");
            return;
        }

        const historyResponse = await getPlanHistory(patient.id);
        if (historyResponse.success && Array.isArray(historyResponse.data?.plans)) {
            setPlanHistory(historyResponse.data.plans);
            const current = historyResponse.data.plans.find((item) => item.is_current) || historyResponse.data.plans[0] || null;
            setViewingPlanId(current?.id || null);
            setPlan(current || null);
        } else {
            setPlanHistory([]);
            setViewingPlanId(null);
            setPlan(null);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "goals", label: "Goals", icon: Target },
        { id: "reflections", label: "Journal", icon: MessageCircle },
        { id: "plans", label: "Plans", icon: FileText },
        { id: "history", label: "History", icon: HistoryIcon },
    ];

    const assessmentHasData = Boolean(
        patient?.activity_level ||
        patient?.goal ||
        patient?.bmi ||
        patient?.tdee ||
        planStats.hasPlan
    );

    return (
        <div className="fade-up dd-mobile-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }} className="patient-header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={T.heading}>{patient?.name || "Unnamed Patient"}</h1>
                        <p style={T.subheading}>Patient ID: {formatShortPatientId(patient)}</p>
                    </div>
                </div>
                <button onClick={() => onEditPlan(patient)} className="btn-primary">
                    <Plus size={16} strokeWidth={2.5} />
                    Update Plan
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }} className="patient-metrics-grid">
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Plan Status</div>
                    <div style={{ marginTop: '4px' }}>
                        <span className={planStats.hasPlan ? "badge-active" : "status-pill"}>
                            {planStats.hasPlan ? "Saved plan" : "No saved plan"}
                        </span>
                    </div>
                </div>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Demographics</div>
                    <div style={{ ...T.value, marginTop: '4px' }}>{formatValue(patient?.age, "y")} / {formatValue(patient?.gender)}</div>
                </div>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Vitals</div>
                    <div style={{ ...T.value, marginTop: '4px' }}>{formatValue(patient?.height, "cm")} / {formatValue(patient?.weight, "kg")}</div>
                </div>
                <div className="dd-card" style={{ padding: '16px' }}>
                    <div style={T.label}>Metabolic BMI</div>
                    <div style={{ ...T.value, marginTop: '4px', color: patient?.bmi ? 'var(--brand-green)' : 'var(--text-muted)' }}>{formatValue(patient?.bmi)}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', overflowX: 'auto', paddingBottom: '2px' }}>
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
                                color: active ? 'var(--brand-green)' : 'var(--text-secondary)',
                                borderBottom: active ? '2px solid var(--brand-green)' : '2px solid transparent',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ minHeight: '400px' }}>
                {activeTab === "overview" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }} className="patient-overview-grid">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <Activity size={18} style={{ color: 'var(--brand-green)' }} />
                                    <h3 style={T.sectionTitle}>Current Assessment</h3>
                                </div>

                                {!assessmentHasData ? (
                                    <EmptyChartState>
                                        Assessment will appear after patient profile and plan are completed.
                                    </EmptyChartState>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                        <MetricTile label="Activity" value={formatValue(patient?.activity_level)} />
                                        <MetricTile label="Goal" value={formatValue(patient?.goal)} />
                                        <MetricTile label="BMI" value={formatValue(patient?.bmi)} accent={Boolean(patient?.bmi)} />
                                        <MetricTile
                                            label="Plan Calories"
                                            value={planStats.avgCalories ? `${planStats.avgCalories} kcal/day avg` : formatValue(patient?.tdee, " kcal target")}
                                            accent={Boolean(planStats.avgCalories || patient?.tdee)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                                    <h3 style={T.sectionTitle}>Clinical Background</h3>
                                </div>
                                {clinicalRows.length === 0 ? (
                                    <EmptyChartState>No clinical background recorded yet.</EmptyChartState>
                                ) : (
                                    <div className="clinical-row-list">
                                        {clinicalRows.map((row) => (
                                            <div key={row.label} className="clinical-row">
                                                <span>{row.label}</span>
                                                <strong>{row.value}</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <TrendingUp size={18} style={{ color: 'var(--brand-green)' }} />
                                    <h3 style={T.sectionTitle}>Weight Trend</h3>
                                </div>
                                <WeightTrendChart points={weightHistory} />
                            </div>

                            <div className="dd-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <TrendingUp size={18} style={{ color: 'var(--brand-green)' }} />
                                    <h3 style={T.sectionTitle}>Consistency Heatmap</h3>
                                </div>
                                <ConsistencyHeatmap logs={logs} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "goals" && (
                    <ComingSoonPanel
                        title="Goals"
                        description="Goal setting, milestones, and adherence targets are coming soon. For now, use Overview and Plans for active clinical work."
                    />
                )}

                {activeTab === "reflections" && (
                    <ComingSoonPanel
                        title="Journal"
                        description="Patient journal entries and check-ins are coming soon in this profile view."
                    />
                )}

                {activeTab === "plans" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="dd-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                                <h3 style={T.sectionTitle}>Plans</h3>
                                <p style={{ ...T.subheading, margin: '4px 0 0' }}>
                                    {loadingPlan ? "Loading plans..." : activePlan ? "Review the active plan or open a previous version." : "No saved plans yet."}
                                </p>
                            </div>
                            <button className="btn-primary" onClick={() => onEditPlan(patient)}>
                                <Plus size={16} strokeWidth={2.5} />
                                New Plan
                            </button>
                        </div>

                        {!activePlan ? (
                            <EmptyChartState>No saved diet plan yet. Create and save a plan to review it here.</EmptyChartState>
                        ) : (
                            <>
                                <PlanSummaryCard
                                    title="Current saved diet plan"
                                    planItem={activePlan}
                                    stats={getPlanStats(activePlan)}
                                    active
                                    onView={() => setViewingPlanId(activePlan.id)}
                                    onDelete={() => handleDeletePlan(activePlan)}
                                />

                                <div className="dd-card" style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                                        <h3 style={T.sectionTitle}>Viewing: {viewingPlan?.is_current ? "Current Plan" : "Previous Plan"}</h3>
                                        <p style={{ ...T.subheading, margin: '4px 0 0' }}>
                                            Saved {formatDisplayDate(viewingPlan?.saved_at)} · {viewingPlanStats.totalItems} foods · {viewingPlanStats.daysWithMeals}/7 planned days
                                        </p>
                                    </div>
                                    <PlanDayTable planItem={viewingPlan} />
                                </div>

                                <div>
                                    <h3 style={{ ...T.sectionTitle, marginBottom: '12px' }}>Previous Plans</h3>
                                    {previousPlans.length === 0 ? (
                                        <EmptyChartState>No previous plans yet. When you save a new plan, the old one will appear here.</EmptyChartState>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                            {previousPlans.map((item, index) => (
                                                <PlanSummaryCard
                                                    key={item.id}
                                                    title={`Previous plan ${previousPlans.length - index}`}
                                                    planItem={item}
                                                    stats={getPlanStats(item)}
                                                    onView={() => setViewingPlanId(item.id)}
                                                    onDelete={() => handleDeletePlan(item)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "history" && (
                    <ComingSoonPanel
                        title="History"
                        description="Detailed timeline, follow-up weights, and journal history are coming soon."
                    />
                )}
            </div>
        </div>
    );
}
