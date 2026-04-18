import React, { useState } from 'react';
import { 
    User, 
    Bell, 
    Shield, 
    Moon, 
    Sun, 
    Grid, 
    Mail, 
    Building2,
    Save,
    Lock,
    KeyRound,
    CheckCircle2
} from 'lucide-react';
import { 
    Snackbar, 
    Alert, 
    CircularProgress, 
    Switch,
    IconButton
} from '@mui/material';
import { useColorMode } from '../context/ThemeContext';

const T = {
    heading: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' },
    sectionTitle: { fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' },
    label: { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }
};

export default function Settings() {
    const { mode, toggleColorMode } = useColorMode();
    
    // Notifications state
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('dietdesk_notifications');
        return saved ? JSON.parse(saved) : {
            email: true,
            patientUpdates: true,
            marketing: false
        };
    });

    // Profile state
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('dietdesk_profile');
        return saved ? JSON.parse(saved) : {
            name: 'Dr. Sarah Mitchell',
            email: 'sarah.mitchell@dietdesk.com',
            specialization: 'Clinical Nutritionist',
            bio: 'Passionate about personalized nutrition and clinical weight management. 10+ years experience in metabolic health.'
        };
    });

    // Clinic state
    const [clinic, setClinic] = useState(() => {
        const saved = localStorage.getItem('dietdesk_clinic');
        return saved ? JSON.parse(saved) : {
            name: 'Mitchell Clinical Health',
            address: '123 Wellness Ave, Suite 400, New York, NY',
            license: 'RD-884210-SA',
            phone: '+1 (555) 0123-4567'
        };
    });

    // Security state
    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // UI Feedback state
    const [loadingSection, setLoadingSection] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const handleToastClose = () => setToast({ ...toast, open: false });

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    const simulateSave = async (sectionName) => {
        setLoadingSection(sectionName);
        
        // Actually persist to localStorage for realism
        if (sectionName === 'Profile') {
            localStorage.setItem('dietdesk_profile', JSON.stringify(profile));
        } else if (sectionName === 'Clinic details') {
            localStorage.setItem('dietdesk_clinic', JSON.stringify(clinic));
        } else if (sectionName === 'Preferences') {
            localStorage.setItem('dietdesk_notifications', JSON.stringify(notifications));
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingSection(null);
        showToast(`${sectionName} updated successfully!`);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (security.newPassword.length < 8) {
            showToast('New password must be at least 8 characters long', 'error');
            return;
        }
        if (security.newPassword !== security.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        setLoadingSection('security');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoadingSection(null);
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password updated successfully!');
    };

    return (
        <div className="fade-up px-6 py-8 max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 style={T.heading}>Settings</h1>
                <p style={T.subheading}>Manage your account preferences and clinical workspace.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Profile Information */}
                <div className="dd-card p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950 dark:text-emerald-400">
                            <User size={22} strokeWidth={2.5} />
                        </div>
                        <h2 style={T.sectionTitle}>Profile Information</h2>
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        <div>
                            <label style={T.label}>Full Name</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={profile.name}
                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                                placeholder="e.g. Dr. Sarah Mitchell"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Email Address</label>
                            <input 
                                className="input-premium" 
                                type="email" 
                                value={profile.email}
                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                placeholder="you@clinic.com"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Specialization</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={profile.specialization}
                                onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                                placeholder="Clinical Nutritionist"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Bio / Personal Note</label>
                            <textarea 
                                className="form-textarea w-full" 
                                rows={3}
                                value={profile.bio}
                                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                placeholder="Write a short summary..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button 
                            className="btn-primary flex items-center gap-2"
                            onClick={() => simulateSave('Profile')}
                            disabled={loadingSection === 'Profile'}
                        >
                            {loadingSection === 'Profile' ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                            Save Profile
                        </button>
                    </div>
                </div>

                {/* 2. Clinic Details */}
                <div className="dd-card p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-950 dark:text-blue-400">
                            <Building2 size={22} strokeWidth={2.5} />
                        </div>
                        <h2 style={T.sectionTitle}>Clinic Details</h2>
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        <div>
                            <label style={T.label}>Clinic Name</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.name}
                                onChange={(e) => setClinic({...clinic, name: e.target.value})}
                                placeholder="e.g. Mitchell Clinical Health"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Address</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.address}
                                onChange={(e) => setClinic({...clinic, address: e.target.value})}
                                placeholder="123 Wellness Ave, Suite 400"
                            />
                        </div>
                        <div>
                            <label style={T.label}>License Number</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.license}
                                onChange={(e) => setClinic({...clinic, license: e.target.value})}
                                placeholder="RD-000000"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Contact Phone</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.phone}
                                onChange={(e) => setClinic({...clinic, phone: e.target.value})}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button 
                            className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => simulateSave('Clinic details')}
                            disabled={loadingSection === 'Clinic details'}
                        >
                            {loadingSection === 'Clinic details' ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                            Save Clinic
                        </button>
                    </div>
                </div>

                {/* 3. Preferences */}
                <div className="dd-card p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg dark:bg-amber-950 dark:text-amber-400">
                            <Grid size={22} strokeWidth={2.5} />
                        </div>
                        <h2 style={T.sectionTitle}>System Preferences</h2>
                    </div>
                    
                    <div className="space-y-8 flex-1">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    {mode === 'dark' ? <Moon size={20} className="text-amber-400" /> : <Sun size={20} className="text-amber-500" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold m-0">Appearance</h4>
                                    <p className="text-xs text-slate-500 m-0">Toggle between light and dark modes</p>
                                </div>
                            </div>
                            <Switch 
                                checked={mode === 'dark'} 
                                onChange={toggleColorMode}
                                color="primary" 
                            />
                        </div>

                        {/* Notifications Toggle */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Notification Settings</h4>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Email Notifications</div>
                                    <div className="text-xs text-slate-500">Receive reports and alerts via email</div>
                                </div>
                                <Switch 
                                    checked={notifications.email} 
                                    onChange={() => setNotifications({...notifications, email: !notifications.email})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Patient Activity</div>
                                    <div className="text-xs text-slate-500">Get notified when patients log meals</div>
                                </div>
                                <Switch 
                                    checked={notifications.patientUpdates} 
                                    onChange={() => setNotifications({...notifications, patientUpdates: !notifications.patientUpdates})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button 
                            className="btn-primary flex items-center gap-2"
                            onClick={() => simulateSave('Preferences')}
                            disabled={loadingSection === 'Preferences'}
                        >
                            {loadingSection === 'Preferences' ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                            Save Preferences
                        </button>
                    </div>
                </div>

                {/* 4. Security */}
                <div className="dd-card p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-950 dark:text-red-400">
                            <Shield size={22} strokeWidth={2.5} />
                        </div>
                        <h2 style={T.sectionTitle}>Security & Password</h2>
                    </div>
                    
                    <form onSubmit={handlePasswordUpdate} className="space-y-5 flex-1">
                        <div>
                            <label style={T.label}>Current Password</label>
                            <div className="relative">
                                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    className="input-premium pl-10" 
                                    type="password" 
                                    value={security.currentPassword}
                                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label style={T.label}>New Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        className="input-premium pl-10" 
                                        type="password" 
                                        value={security.newPassword}
                                        onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                                        placeholder="At least 8 chars"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={T.label}>Confirm New Password</label>
                                <div className="relative">
                                    <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        className="input-premium pl-10" 
                                        type="password" 
                                        value={security.confirmPassword}
                                        onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button 
                                type="submit"
                                className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
                                disabled={loadingSection === 'security'}
                            >
                                {loadingSection === 'security' ? <CircularProgress size={18} color="inherit" /> : <Shield size={18} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MUI Snackbar for Feedback */}
            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={handleToastClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
