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
    ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'patients',   label: 'Patients',     icon: Users },
    { id: 'plans',      label: 'Plans',        icon: FileText },
    { id: 'progress',   label: 'Progress',     icon: Activity },
    { id: 'settings',   label: 'Settings',     icon: Settings },
];

const CREATE_ITEM = { id: 'create', label: 'Create Plan', icon: PlusCircle };

function NavItem({ item, active, onClick }) {
    const Icon = item.icon;
    const isCreate = item.id === 'create';

    if (isCreate) {
        return (
            <button
                onClick={() => onClick(item.id)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    background: '#16a34a',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
                    transition: 'background 0.15s ease, box-shadow 0.15s ease',
                    marginTop: '6px',
                    marginBottom: '6px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; }}
            >
                <Icon size={17} strokeWidth={2.2} />
                {item.label}
            </button>
        );
    }

    return (
        <button
            onClick={() => onClick(item.id)}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.15s ease, color 0.15s ease',
                position: 'relative',
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
            }}
        >
            {active && (
                <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '18px',
                    background: '#22c55e',
                    borderRadius: '0 3px 3px 0',
                }} />
            )}
            <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.8}
                style={{ color: active ? '#22c55e' : 'inherit', flexShrink: 0 }}
            />
            {item.label}
        </button>
    );
}

function SidebarContent({ activeView, onNavigate, onLogout, username }) {
    const initial = username ? username[0].toUpperCase() : 'D';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '22px 20px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
            }}>
                <div style={{
                    width: 32, height: 32,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 800, color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(22,163,74,0.4)',
                }}>D</div>
                <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>DietDesk</div>
                    <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Clinical</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', padding: '0 14px', marginBottom: '8px' }}>
                    Menu
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {NAV_ITEMS.slice(0, 2).map(item => (
                        <NavItem key={item.id} item={item} active={activeView === item.id} onClick={onNavigate} />
                    ))}
                    <div style={{ margin: '6px 0' }}>
                        <NavItem item={CREATE_ITEM} active={false} onClick={onNavigate} />
                    </div>
                    {NAV_ITEMS.slice(2).map(item => (
                        <NavItem key={item.id} item={item} active={activeView === item.id} onClick={onNavigate} />
                    ))}
                </div>
            </nav>

            {/* Profile + Logout */}
            <div style={{
                padding: '14px 12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    background: 'rgba(255,255,255,0.04)',
                }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>{initial}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {username || 'Dietitian'}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Dietitian</div>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        background: 'transparent',
                        color: 'rgba(248, 113, 113, 0.7)',
                        transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                        e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(248, 113, 113, 0.7)';
                    }}
                >
                    <LogOut size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default function Sidebar({ activeView, onNavigate, onLogout, username }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleNavigate = (id) => {
        onNavigate(id);
        setDrawerOpen(false);
    };

    const sidebarStyle = {
        width: 240,
        background: '#0f172a',
        height: '100vh',
        flexShrink: 0,
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:block"
                style={{ ...sidebarStyle, position: 'sticky', top: 0, overflowY: 'auto' }}
            >
                <SidebarContent activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout} username={username} />
            </aside>

            {/* Mobile Top Bar */}
            <div
                className="lg:hidden"
                style={{
                    position: 'sticky', top: 0, zIndex: 60,
                    background: '#0f172a',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    padding: '0 16px',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '7px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800, color: 'white',
                        boxShadow: '0 2px 6px rgba(22,163,74,0.4)',
                    }}>D</div>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>DietDesk</span>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Mobile Drawer */}
            {drawerOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                    }}
                    onClick={() => setDrawerOpen(false)}
                >
                    <div
                        style={{ ...sidebarStyle, height: '100%', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <SidebarContent activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout} username={username} />
                    </div>
                </div>
            )}
        </>
    );
}
