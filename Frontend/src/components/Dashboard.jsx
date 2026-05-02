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
    MoreHorizontal,
    Search
} from "lucide-react";
import { 
    Box, 
    Typography, 
    Grid, 
    IconButton, 
    Button, 
    Stack, 
    Badge, 
    Popover, 
    List, 
    ListItem, 
    ListItemText, 
    CircularProgress,
    Tooltip
} from "@mui/material";
import { getPatients } from "../services/api";
import { useAuth } from "../context/AuthContext";

const T = {
    label: { fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block' },
    heading: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' },
    sectionTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em' },
    stat: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 },
};

export default function Dashboard({ onCreatePlan, onSelectClient, onNavigate }) {
    const { user } = useAuth();
    
    // Unified Dashboard State (Data-Driven Model)
    const [state, setState] = useState({
        stats: {
            totalPatients: 0,
            activePlans: 0,
            pendingTasks: 0,
            unreadNotifications: 0
        },
        recentPatients: [],
        priorityTasks: [],
        notifications: [],
        loading: true
    });

    const [notifAnchor, setNotifAnchor] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const res = await getPatients();
                if (res.success && Array.isArray(res.data)) {
                    // In a real app, these would come from specific dashboard endpoints
                    // For now, we derive what we can from patients and use empty for the rest
                    setState({
                        stats: {
                            totalPatients: res.data.length,
                            activePlans: res.data.filter(p => !p.archived).length, // assuming archived property or similar
                            pendingTasks: 0, // Should come from a tasks API
                            unreadNotifications: 0 // Should come from a notifications API
                        },
                        recentPatients: res.data.slice(0, 3), // Only 3 as requested
                        priorityTasks: [], 
                        notifications: [], 
                        loading: false
                    });
                } else {
                    setState(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error("Dashboard load failed:", error);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        loadDashboardData();
    }, []);

    const handleNotifClick = (event) => setNotifAnchor(event.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);

    if (state.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={32} thickness={5} sx={{ color: 'var(--brand-green)' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2.5, md: 4, lg: 5 }, maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* ── Verification Warning Banner ── */}
            {user?.email_verified === false && (
                <Box sx={{ 
                    background: 'linear-gradient(90deg, #fff1f2 0%, #fff 100%)', 
                    border: '1px solid #fda4af',
                    borderRadius: '12px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    animation: 'fade-in 0.5s ease-out'
                }}>
                    <Box sx={{ 
                        width: 40, height: 40, borderRadius: '10px', 
                        background: '#ffe4e6', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Bell size={20} color="#e11d48" strokeWidth={2.5} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#9f1239' }}>
                            Email Verification Required
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#be123c' }}>
                            Please verify your email within 2 days to maintain access to your account. 
                            {user.verification_deadline && ` Deadline: ${new Date(user.verification_deadline).toLocaleDateString()}`}
                        </Typography>
                    </Box>
                    <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => onNavigate('settings')}
                        sx={{ 
                            borderRadius: '8px', textTransform: 'none', fontWeight: 700, 
                            borderColor: '#fda4af', color: '#e11d48',
                            '&:hover': { borderColor: '#e11d48', background: '#fff1f2' }
                        }}
                    >
                        Verify Now
                    </Button>
                </Box>
            )}
            {/* ── Page Header ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2.5}>
                <Box>
                    <Typography sx={T.heading}>
                        Welcome back, {user?.username?.split(' ')[0] || 'Clinician'}
                    </Typography>
                    <Typography sx={T.subheading}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Typography>
                </Box>
                
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Tooltip title="Notifications">
                        <IconButton 
                            onClick={state.notifications.length > 0 ? handleNotifClick : undefined}
                            disabled={state.notifications.length === 0}
                            sx={{ 
                                background: 'var(--surface)', 
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                width: 44, height: 44,
                                boxShadow: 'var(--card-shadow)',
                                '&:hover': { background: '#f8fafc' }
                            }}
                        >
                            <Badge badgeContent={state.stats.unreadNotifications} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 800 } }}>
                                <Bell size={20} strokeWidth={2} color="var(--text-secondary)" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    
                    <Button
                        variant="contained"
                        onClick={onCreatePlan}
                        startIcon={<Plus size={18} strokeWidth={3} />}
                        sx={{
                            background: 'var(--brand-green)',
                            '&:hover': { background: 'var(--brand-green-hover)' },
                            borderRadius: '10px',
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 3,
                            height: 44,
                            boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                        }}
                    >
                        Create Plan
                    </Button>
                </Stack>
            </Stack>

            {/* ── Stat Cards ── */}
            <Grid container spacing={2.5}>
                {[
                    { label: "Total Patients", val: state.stats.totalPatients, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
                    { label: "Active Plans", val: state.stats.activePlans, icon: FileText, color: '#16a34a', bg: '#f0fdf4' },
                    { label: "Pending Follow-ups", val: state.stats.pendingTasks, icon: Clock, color: '#d97706', bg: '#fffbeb' },
                    { label: "Notifications", val: state.stats.unreadNotifications, icon: Bell, color: '#6366f1', bg: '#eef2ff' },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Box className="dd-card" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                                width: 44, height: 44, borderRadius: '10px', 
                                background: stat.bg, display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
                            </Box>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography sx={{ ...T.label, fontSize: '0.65rem', mb: 0.2 }}>{stat.label}</Typography>
                                <Typography sx={{ ...T.stat, fontSize: '1.5rem' }}>{stat.val || 0}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* ── Main Layout ── */}
            <Grid container spacing={4}>
                
                {/* 1. Recent Patients */}
                <Grid item xs={12} lg={8}>
                    <Box className="dd-card h-full" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <Typography sx={T.sectionTitle}>Recent Patients</Typography>
                            <Button 
                                onClick={() => onNavigate('patients')}
                                sx={{ 
                                    textTransform: 'none', fontWeight: 700, 
                                    fontSize: '0.85rem', color: 'var(--brand-green)',
                                    '&:hover': { background: 'rgba(22,163,74,0.05)' }
                                }}
                                endIcon={<ArrowUpRight size={16} />}
                            >
                                View All
                            </Button>
                        </Stack>
                        
                        <Box sx={{ flex: 1 }}>
                            {state.recentPatients.length === 0 ? (
                                <Box sx={{ p: 8, textAlign: 'center' }}>
                                    <Box sx={{ color: 'var(--text-muted)', mb: 2, opacity: 0.3 }}>
                                        <Users size={48} style={{ margin: '0 auto' }} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, mb: 0.5, color: 'var(--text-primary)' }}>No patients yet</Typography>
                                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Patients you recently worked with will appear here.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {state.recentPatients.map((patient, idx) => (
                                        <Box
                                            key={patient.id}
                                            component="button"
                                            onClick={() => onSelectClient(patient)}
                                            sx={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: 2.5,
                                                p: '16px 24px', borderBottom: idx < state.recentPatients.length - 1 ? '1px solid var(--border)' : 'none',
                                                border: 'none', cursor: 'pointer', background: 'transparent', textAlign: 'left',
                                                '&:hover': { background: '#f8fafc' }, transition: 'background 0.2s'
                                            }}
                                        >
                                            <Box sx={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.9rem', fontWeight: 800, color: '#15803d', flexShrink: 0,
                                            }}>{patient.name?.charAt(0)}</Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{patient.name}</Typography>
                                                <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {patient.goal} • {patient.age}y
                                                </Typography>
                                            </Box>
                                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontSize: '0.6875rem', fontWeight: 700 }}>Active</Box>
                                            <ChevronRight size={18} color="var(--text-muted)" />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Grid>

                {/* 2. Side Panel */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        
                        {/* Priority Tasks */}
                        <Box className="dd-card">
                            <Box sx={{ p: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                                <Typography sx={T.sectionTitle}>Priority Tasks</Typography>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {state.priorityTasks.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                            No priority tasks right now.
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', mt: 1 }}>
                                            Task automation module is being connected.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={2}>
                                        {state.priorityTasks.map((task, i) => (
                                            <Stack key={i} direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-green)' }} />
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{task.text}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Box>

                        {/* Clinical Activity / Overview */}
                        <Box sx={{ 
                            background: 'var(--sidebar-bg)', 
                            borderRadius: '12px', p: 4, 
                            color: 'white', position: 'relative', overflow: 'hidden' 
                        }}>
                            <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.05 }}>
                                <TrendingUp size={120} />
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', mb: 2, display: 'block', letterSpacing: '0.05em' }}>Daily Overview</Typography>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}>Practice Status</Typography>
                            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', mb: 3 }}>Your clinical operations are running smoothly today.</Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, mb: 0.5, display: 'block' }}>REPORTS</Typography>
                                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 800 }}>{state.stats.activePlans}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, mb: 0.5, display: 'block' }}>ALERTS</Typography>
                                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 800 }}>0</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                    </Stack>
                </Grid>

            </Grid>

            {/* Notification Popover */}
            <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={handleNotifClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ 
                    sx: { 
                        width: 340, mt: 1.5, borderRadius: '12px', border: '1px solid var(--border)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)' 
                    } 
                }}
            >
                <Box sx={{ p: 2.5, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem' }}>Notifications</Typography>
                    {state.notifications.length > 0 && (
                        <Button size="small" sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-green)' }}>Mark all read</Button>
                    )}
                </Box>
                <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
                    {state.notifications.length === 0 ? (
                        <Box sx={{ p: 5, textAlign: 'center' }}>
                            <Box sx={{ color: 'var(--text-muted)', mb: 1.5, opacity: 0.3 }}>
                                <Bell size={32} style={{ margin: '0 auto' }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>No new notifications</Typography>
                        </Box>
                    ) : (
                        state.notifications.map((notif) => (
                            <ListItem key={notif.id} sx={{ borderBottom: '1px solid var(--border)', py: 2, '&:last-child': { border: 0 }, '&:hover': { background: '#f8fafc' } }}>
                                <ListItemText 
                                    primary={notif.text} 
                                    secondary={notif.time}
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5, color: 'var(--text-primary)' }}
                                    secondaryTypographyProps={{ fontSize: '0.7rem', fontWeight: 500 }}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </Popover>
            
        </Box>
    );
}
