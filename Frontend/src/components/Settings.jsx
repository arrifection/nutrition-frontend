import React, { useState } from 'react';
import { 
    User, 
    Shield, 
    Moon, 
    Sun, 
    Grid, 
    Building2,
    Save,
    Lock
} from 'lucide-react';
import { 
    Snackbar, 
    Alert, 
    CircularProgress, 
    Switch
} from '@mui/material';
import { useColorMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../services/api';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';

const T = {
    heading: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' },
    sectionTitle: { fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' },
    label: { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }
};

const EMPTY_CLINIC = {
    name: '',
    address: '',
    license: '',
    phone: ''
};

const OLD_DEMO_CLINIC = {
    name: 'Mitchell Clinical Health',
    address: '123 Wellness Ave, Suite 400, New York, NY',
    license: 'RD-884210-SA',
    phone: '+1 (555) 0123-4567'
};

const isOldDemoClinic = (clinic) =>
    clinic &&
    clinic.name === OLD_DEMO_CLINIC.name &&
    clinic.address === OLD_DEMO_CLINIC.address &&
    clinic.license === OLD_DEMO_CLINIC.license &&
    clinic.phone === OLD_DEMO_CLINIC.phone;

export default function Settings() {
    const { mode, toggleColorMode } = useColorMode();
    const { user } = useAuth();
    
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
            name: user?.username || '',
            email: user?.email || '',
            specialization: '',
            bio: ''
        };
    });

    // Clinic state
    const [clinic, setClinic] = useState(() => {
        const saved = localStorage.getItem('dietdesk_clinic');
        if (!saved) return EMPTY_CLINIC;

        const parsed = JSON.parse(saved);
        return isOldDemoClinic(parsed) ? EMPTY_CLINIC : { ...EMPTY_CLINIC, ...parsed };
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
                                placeholder="Clinic or practice name"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Address</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.address}
                                onChange={(e) => setClinic({...clinic, address: e.target.value})}
                                placeholder="Clinic address"
                            />
                        </div>
                        <div>
                            <label style={T.label}>License Number</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.license}
                                onChange={(e) => setClinic({...clinic, license: e.target.value})}
                                placeholder="License or registration number"
                            />
                        </div>
                        <div>
                            <label style={T.label}>Contact Phone</label>
                            <input 
                                className="input-premium" 
                                type="text" 
                                value={clinic.phone}
                                onChange={(e) => setClinic({...clinic, phone: e.target.value})}
                                placeholder="Clinic phone number"
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

                {/* 4. Email Verification */}
                <div className="dd-card p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${user?.email_verified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'}`}>
                            {user?.email_verified ? <CheckCircle size={22} strokeWidth={2.5} /> : <Mail size={22} strokeWidth={2.5} />}
                        </div>
                        <h2 style={T.sectionTitle}>Email Verification</h2>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${user?.email_verified ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                <span className="text-sm font-bold">
                                    {user?.email_verified ? 'Account Verified' : 'Action Required'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                {user?.email_verified 
                                    ? 'Your email address has been successfully verified. You have full access to all clinical features.' 
                                    : 'Please verify your email address to ensure uninterrupted access to your clinical workspace.'}
                            </p>
                            {!user?.email_verified && user?.verification_deadline && (
                                <div className="mt-3 flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-wider">
                                    <AlertTriangle size={12} />
                                    Deadline: {new Date(user.verification_deadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        {!user?.email_verified && (
                            <button 
                                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                                onClick={async () => {
                                    setLoadingSection('Resend');
                                    const res = await resendVerification();
                                    setLoadingSection(null);
                                    if (res.success) showToast('Verification email sent!', 'success');
                                    else showToast(res.error, 'error');
                                }}
                                disabled={loadingSection === 'Resend'}
                            >
                                {loadingSection === 'Resend' ? (
                                    <CircularProgress size={16} color="inherit" />
                                ) : (
                                    <>
                                        <Mail size={16} className="group-hover:scale-110 transition-transform" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            Status: <span className={user?.email_verified ? 'text-emerald-500' : 'text-rose-500'}>
                                {user?.email_verified ? 'Active' : 'Restricted'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 5. Security */}
                <div className="dd-card p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-950 dark:text-red-400">
                            <Shield size={22} strokeWidth={2.5} />
                        </div>
                        <h2 style={T.sectionTitle}>Security & Password</h2>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                <Lock size={16} />
                                Password controls are being connected
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Password update and session management will be enabled with backend email verification rollout.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                className="btn-secondary flex items-center gap-2"
                                disabled
                                style={{ cursor: 'not-allowed', opacity: 0.7 }}
                            >
                                <Shield size={18} />
                                Coming Soon
                            </button>
                        </div>
                    </div>
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
