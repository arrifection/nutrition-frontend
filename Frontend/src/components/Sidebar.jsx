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
    LogOut
} from 'lucide-react';

export default function Sidebar({ activeView, onNavigate, onLogout, username }) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'create', label: 'Create Plan', icon: PlusCircle, highlight: true },
        { id: 'plans', label: 'Plans', icon: FileText },
        { id: 'progress', label: 'Progress', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const NavContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300 p-4">
            <div className="flex items-center gap-3 px-2 mb-10 mt-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xl">D</div>
                <h1 className="text-xl font-black text-white tracking-tight uppercase">DIETDESK</h1>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onNavigate(item.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${item.highlight
                                    ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 my-4'
                                    : activeView === item.id
                                        ? 'bg-white/10 text-white font-semibold'
                                        : 'hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                <div className="px-4 py-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{username || 'Dietitian'}</p>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-semibold"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 shadow-sm shrink-0">
                <NavContent />
            </aside>

            {/* Mobile Header & Hamburger */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/10 sticky top-0 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center text-white font-black text-lg">D</div>
                    <h1 className="text-lg font-black text-white tracking-tight uppercase">DIETDESK</h1>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
                        <NavContent />
                    </div>
                </div>
            )}
        </>
    );
}
