import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    PlusCircle,
    FileText,
    Activity,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { 
    Tooltip, 
    IconButton, 
    useMediaQuery, 
    useTheme, 
    Drawer, 
    Box, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Typography,
    Button,
    Divider
} from '@mui/material';

const NAV_ITEMS = [
    { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'patients',   label: 'Patients',     icon: Users },
    { id: 'create',     label: 'Create Plan',  icon: PlusCircle },
    { id: 'plans',      label: 'Plans',        icon: FileText },
    { id: 'progress',   label: 'Progress',     icon: Activity },
    { id: 'settings',   label: 'Settings',     icon: Settings },
];

export default function Sidebar({ activeView, onNavigate, onLogout, username }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const initial = username ? username[0].toUpperCase() : 'D';

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigate = (id) => {
        onNavigate(id);
        if (isMobile) setMobileOpen(false);
    };

    const sidebarContent = (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'var(--sidebar-bg)',
            color: 'white',
            width: collapsed && !isMobile ? 80 : 250,
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
        }}>
            {/* Branding Header */}
            <Box sx={{ 
                p: collapsed && !isMobile ? '24px 0' : '24px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                gap: '12px',
                minHeight: 80,
            }}>
                <Box sx={{
                    width: 36, height: 36,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 800, color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
                }}>D</Box>
                {(!collapsed || isMobile) && (
                    <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>DietDesk</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinician Portal</Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 3, px: collapsed && !isMobile ? 1.5 : 2, overflowY: 'auto', overflowX: 'hidden' }}>
                {!collapsed || isMobile ? (
                    <Typography sx={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        color: 'rgba(255,255,255,0.25)', 
                        px: 2, 
                        mb: 2,
                        display: 'block'
                    }}>
                        Main Menu
                    </Typography>
                ) : (
                    <Box sx={{ height: 26, mb: 2 }} />
                )}
                
                <List sx={{ p: 0, gap: '4px', display: 'flex', flexDirection: 'column' }}>
                    {NAV_ITEMS.map((item) => {
                        const active = activeView === item.id;
                        const Icon = item.icon;
                        return (
                            <Tooltip key={item.id} title={collapsed && !isMobile ? item.label : ''} placement="right">
                                <ListItem disablePadding>
                                    <ListItemButton 
                                        onClick={() => handleNavigate(item.id)}
                                        sx={{
                                            borderRadius: '10px',
                                            justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                                            px: (collapsed && !isMobile) ? 0 : 2,
                                            height: 48,
                                            backgroundColor: active ? 'var(--sidebar-active)' : 'transparent',
                                            color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                            '&:hover': {
                                                backgroundColor: 'var(--sidebar-hover)',
                                                color: '#ffffff'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <ListItemIcon sx={{ 
                                            minWidth: (collapsed && !isMobile) ? 0 : 36, 
                                            color: active ? '#22c55e' : 'inherit',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                                        </ListItemIcon>
                                        {(!collapsed || isMobile) && (
                                            <ListItemText 
                                                primary={item.label} 
                                                primaryTypographyProps={{ 
                                                    fontSize: '0.875rem', 
                                                    fontWeight: active ? 700 : 500,
                                                    letterSpacing: '0.01em'
                                                }} 
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>
                        );
                    })}
                </List>
            </Box>

            {/* Profile Section */}
            <Box sx={{ 
                p: '16px', 
                mt: 'auto',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(0,0,0,0.15)'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    mb: 1.5,
                    px: (collapsed && !isMobile) ? 0 : 1,
                    justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start'
                }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1e293b, #334155)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: 800, color: 'white', flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>{initial}</Box>
                    {(!collapsed || isMobile) && (
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {username || 'Clinician'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>Administrator</Typography>
                        </Box>
                    )}
                </Box>
                
                <Tooltip title={collapsed && !isMobile ? 'Logout' : ''} placement="right">
                    <ListItemButton 
                        onClick={onLogout}
                        sx={{
                            borderRadius: '8px',
                            justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                            color: '#fca5a5',
                            px: (collapsed && !isMobile) ? 0 : 1,
                            minHeight: 40,
                            '&:hover': {
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                color: '#ef4444'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: (collapsed && !isMobile) ? 0 : 32, color: 'inherit', display: 'flex', justifyContent: 'center' }}>
                            <LogOut size={18} />
                        </ListItemIcon>
                        {(!collapsed || isMobile) && (
                            <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>

            {/* Collapse Toggle */}
            {!isMobile && (
                <Box sx={{ 
                    px: 2, py: 2, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end',
                    background: 'rgba(0,0,0,0.2)',
                }}>
                    <IconButton 
                        onClick={() => setCollapsed(!collapsed)}
                        size="small"
                        sx={{ 
                            color: 'rgba(255,255,255,0.4)', 
                            '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } 
                        }}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </IconButton>
                </Box>
            )}
        </Box>
    );

    return (
        <>
            {/* Desktop Layout Helper */}
            {!isMobile && (
                <Box component="nav" sx={{ width: collapsed ? 80 : 250, transition: 'width 0.2s', flexShrink: 0 }}>
                    <Box sx={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: collapsed ? 80 : 250, transition: 'width 0.2s', zIndex: 1200 }}>
                        {sidebarContent}
                    </Box>
                </Box>
            )}

            {/* Mobile Header + Drawer */}
            {isMobile && (
                <>
                    <Box sx={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100, 
                        height: 64, display: 'flex', alignItems: 'center', px: 2,
                        background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                            <Menu size={24} />
                        </IconButton>
                        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                             <Box sx={{
                                width: 28, height: 28,
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', fontWeight: 800, color: 'white',
                            }}>D</Box>
                            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>DietDesk</Typography>
                        </Box>
                    </Box>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': { width: 260, border: 'none' },
                            zIndex: 1300
                        }}
                    >
                        {sidebarContent}
                    </Drawer>
                    {/* Spacer for mobile fixed header */}
                    <Box sx={{ height: 64 }} />
                </>
            )}
        </>
    );
}
