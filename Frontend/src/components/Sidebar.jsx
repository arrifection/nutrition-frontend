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
            borderRight: '1px solid rgba(255,255,255,0.07)'
        }}>
            {/* Branding Header */}
            <Box sx={{ 
                p: '24px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                minHeight: 80,
                borderBottom: '1px solid rgba(255,255,255,0.06)'
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
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em', color: 'white', display: 'block' }}>DietDesk</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Clinical SaaS</Typography>
                    </Box>
                )}
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, px: collapsed && !isMobile ? 1.5 : 2, overflowY: 'auto', overflowX: 'hidden' }}>
                <Typography sx={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    color: 'rgba(255,255,255,0.25)', 
                    px: (collapsed && !isMobile) ? 1 : 2, 
                    mb: 1,
                    textAlign: (collapsed && !isMobile) ? 'center' : 'left',
                    display: 'block'
                }}>
                    { (collapsed && !isMobile) ? '•' : 'Main Menu' }
                </Typography>
                
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
                                            height: 44,
                                            backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                                            color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                color: 'rgba(255,255,255,0.9)'
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

                {/* Quick Action */}
                <Box sx={{ mt: 3, px: (collapsed && !isMobile) ? 0 : 1 }}>
                    {collapsed && !isMobile ? (
                        <Tooltip title="Create New Plan" placement="right">
                            <IconButton 
                                onClick={() => handleNavigate('create')}
                                sx={{ 
                                    width: 44, height: 44, mx: 'auto', display: 'flex', 
                                    backgroundColor: '#16a34a', color: 'white',
                                    '&:hover': { backgroundColor: '#15803d' },
                                    boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                                }}
                            >
                                <PlusCircle size={20} />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleNavigate('create')}
                            startIcon={<PlusCircle size={18} />}
                            sx={{
                                backgroundColor: '#16a34a',
                                height: 44,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                                '&:hover': { backgroundColor: '#15803d' }
                            }}
                        >
                            Create Plan
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Profile Section */}
            <Box sx={{ 
                p: '16px', 
                borderTop: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(0,0,0,0.1)'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    mb: 1,
                    px: (collapsed && !isMobile) ? 0 : 1,
                    justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start'
                }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800, color: 'white', flexShrink: 0,
                    }}>{initial}</Box>
                    {(!collapsed || isMobile) && (
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                {username || 'Clinician'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block' }}>Dietitian</Typography>
                        </Box>
                    )}
                </Box>
                
                <Tooltip title={collapsed && !isMobile ? 'Logout' : ''} placement="right">
                    <ListItemButton 
                        onClick={onLogout}
                        sx={{
                            borderRadius: '8px',
                            justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                            color: 'rgba(248, 113, 113, 0.7)',
                            px: (collapsed && !isMobile) ? 0 : 1,
                            minHeight: 36,
                            '&:hover': {
                                backgroundColor: 'rgba(248,113,113,0.1)',
                                color: '#f87171'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: (collapsed && !isMobile) ? 0 : 30, color: 'inherit', display: 'flex', justifyContent: 'center' }}>
                            <LogOut size={16} />
                        </ListItemIcon>
                        {(!collapsed || isMobile) && (
                            <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>

            {/* Collapse Toggle (Desktop only) */}
            {!isMobile && (
                <Box sx={{ 
                    px: 2, py: 1.5, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end',
                    borderTop: '1px solid rgba(255,255,255,0.03)'
                }}>
                    <IconButton 
                        onClick={() => setCollapsed(!collapsed)}
                        sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' } }}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </IconButton>
                </Box>
            )}
        </Box>
    );

    return (
        <>
            {/* Desktop Sidebar Container */}
            {!isMobile && (
                <Box component="nav" sx={{ width: collapsed ? 80 : 250, transition: 'width 0.2s', flexShrink: 0 }}>
                    <Box sx={{ position: 'sticky', top: 0, height: '100vh' }}>
                        {sidebarContent}
                    </Box>
                </Box>
            )}

            {/* Mobile Sidebar (Drawer) */}
            {isMobile && (
                <>
                    <Box sx={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100, 
                        height: 60, display: 'flex', alignItems: 'center', px: 2,
                        background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                            <Menu size={24} />
                        </IconButton>
                        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 24, height: 24, backgroundColor: '#22c55e', borderRadius: '4px' }} />
                            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>DietDesk</Typography>
                        </Box>
                    </Box>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': { width: 250, boxSizing: 'border-box', border: 'none' },
                        }}
                    >
                        {sidebarContent}
                    </Drawer>
                </>
            )}
        </>
    );
}
