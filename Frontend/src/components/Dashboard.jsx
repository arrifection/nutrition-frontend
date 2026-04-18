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
    CircularProgress 
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
    const role = user?.role || "dietitian";
    
    // Unified Dashboard State
    const [state, setState] = useState({
        stats: {
            totalPatients: 0,
            activePlans: 0,
            pendingTasks: 0,
            unreadNotifications: 2
        },
        recentPatients: [],
        priorityTasks: [],
        notifications: [
            { id: 1, text: "New patient assigned: Sarah Connor", time: "1h ago" },
            { id: 2, text: "Weekly report ready for Maria", time: "3h ago" }
        ],
        loading: true
    });

    const [notifAnchor, setNotifAnchor] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            const res = await getPatients();
            if (res.success && Array.isArray(res.data)) {
                // Mocking some extra state for completeness
                setState(prev => ({
                    ...prev,
                    stats: {
                        ...prev.stats,
                        totalPatients: res.data.length,
                        activePlans: Math.floor(res.data.length * 0.7)
                    },
                    recentPatients: res.data.slice(0, 3), // Only 3 as requested
                    loading: false
                }));
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        if (role === 'dietitian') loadDashboard();
        else setState(prev => ({ ...prev, loading: false }));
    }, [role]);

    const handleNotifClick = (event) => setNotifAnchor(event.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);

    if (state.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={40} thickness={4} color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2.5, md: 4, lg: 5 }, maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* ── Page Header ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
                <Box>
                    <Typography sx={T.heading}>
                        Hello, {user?.username?.split(' ')[0] || 'Clinician'} 👋
                    </Typography>
                    <Typography sx={T.subheading}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Typography>
                </Box>
                
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Tooltip title="Notifications">
                        <IconButton 
                            onClick={handleNotifClick}
                            sx={{ 
                                background: 'var(--surface)', 
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                boxShadow: 'var(--card-shadow)'
                            }}
                        >
                            <Badge badgeContent={state.stats.unreadNotifications} color="error">
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
                        Create New Plan
                    </Button>
                </Stack>
            </Stack>

            {/* ── Stats Grid ── */}
            <Grid container spacing={2.5}>
                {[
                    { label: "Total Patients", val: state.stats.totalPatients, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
                    { label: "Active Plans", val: state.stats.activePlans, icon: FileText, color: '#16a34a', bg: '#f0fdf4' },
                    { label: "Pending Follow-ups", val: state.stats.pendingTasks, icon: Clock, color: '#d97706', bg: '#fffbeb' },
                    { label: "Alerts", val: 0, icon: Bell, color: '#ef4444', bg: '#fef2f2' },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Box className="dd-card" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{ 
                                width: 48, height: 48, borderRadius: '12px', 
                                background: stat.bg, display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <stat.icon size={22} color={stat.color} strokeWidth={2.5} />
                            </Box>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography sx={T.label}>{stat.label}</Typography>
                                <Typography sx={T.stat}>{stat.val}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* ── Main Dashboard Content ── */}
            <Grid container spacing={3}>
                
                {/* 1. Recent Patients */}
                <Grid item xs={12} lg={8}>
                    <Box className="dd-card h-full" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                            <Typography sx={T.sectionTitle}>Recent Patients</Typography>
                            <Button 
                                onClick={() => onNavigate('patients')}
                                sx={{ 
                                    textTransform: 'none', fontWeight: 700, 
                                    fontSize: '0.8rem', color: 'var(--brand-green)',
                                    '&:hover': { background: 'rgba(22,163,74,0.05)' }
                                }}
                                endIcon={<ArrowUpRight size={14} />}
                            >
                                View All
                            </Button>
                        </Stack>
                        
                        <Box sx={{ flex: 1 }}>
                            {state.recentPatients.length === 0 ? (
                                <Box sx={{ p: 8, textAlign: 'center' }}>
                                    <Box sx={{ color: 'var(--text-muted)', mb: 1, opacity: 0.5 }}>
                                        <Users size={40} sx={{ mx: 'auto' }} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No patients yet</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
                                                width: '100%', display: 'flex', alignItems: 'center', gap: 2,
                                                p: '16px 24px', borderBottom: idx < state.recentPatients.length - 1 ? '1px solid var(--border)' : 'none',
                                                border: 'none', cursor: 'pointer', background: 'transparent', textAlign: 'left',
                                                '&:hover': { background: 'rgba(0,0,0,0.02)' }, transition: 'background 0.2s'
                                            }}
                                        >
                                            <Box sx={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.9rem', fontWeight: 800, color: '#15803d', flexShrink: 0,
                                            }}>{patient.name?.charAt(0)}</Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{patient.name}</Typography>
                                                <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {patient.goal} • {patient.age}y
                                                </Typography>
                                            </Box>
                                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontSize: '0.65rem', fontWeight: 800 }}>Active</Box>
                                            <ChevronRight size={18} color="var(--text-muted)" />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Grid>

                {/* 2. Priority Tasks & Highlights */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        
                        {/* Tasks Card */}
                        <Box className="dd-card">
                            <Box sx={{ p: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                                <Typography sx={T.sectionTitle}>Priority Tasks</Typography>
                            </Box>
                            <Box sx={{ p: 2.5 }}>
                                {state.priorityTasks.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                            No priority tasks right now.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={2}>
                                        {/* Task rendering here if needed */}
                                    </Stack>
                                )}
                            </Box>
                        </Box>

                        {/* Summary/Quick Insight */}
                        <Box sx={{ 
                            background: 'var(--sidebar-bg)', 
                            borderRadius: '12px', p: 3, 
                            color: 'white', position: 'relative', overflow: 'hidden' 
                        }}>
                            <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                                <TrendingUp size={100} />
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>Today's Performance</Typography>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 0.5 }}>All Caught Up!</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>You've finalized 0 nutrition protocols today. Keep it up!</Typography>
                            
                            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                                <Box sx={{ flex: 1, p: 1.5, background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 0.5, display: 'block' }}>SESSION</Typography>
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>1h 12m</Typography>
                                </Box>
                                <Box sx={{ flex: 1, p: 1.5, background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 0.5, display: 'block' }}>REPORTS</Typography>
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>0 NEW</Typography>
                                </Box>
                            </Stack>
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
                        width: 320, mt: 1.5, borderRadius: '12px', border: '1px solid var(--border)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.1)' 
                    } 
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid var(--border)' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Notifications</Typography>
                </Box>
                <List sx={{ p: 0 }}>
                    {state.notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No new notifications</Typography>
                        </Box>
                    ) : (
                        state.notifications.map((notif) => (
                            <ListItem key={notif.id} sx={{ borderBottom: '1px solid var(--border)', '&:last-child': { border: 0 } }}>
                                <ListItemText 
                                    primary={notif.text} 
                                    secondary={notif.time}
                                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}
                                    secondaryTypographyProps={{ fontSize: '0.7rem' }}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </Popover>
            
        </Box>
    );
}
