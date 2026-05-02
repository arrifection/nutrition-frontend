import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const VerifyEmail = ({ onGoToLogin }) => {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('No verification token found in the URL.');
            return;
        }

        const verify = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/verify-email`, {
                    params: { token }
                });
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                
                // Optional: Clean up the URL after verification
                window.history.replaceState({}, document.title, "/");
            } catch (error) {
                console.error('Verification failed:', error);
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Verification failed or the link has expired.');
            }
        };

        verify();
    }, []);

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                    <h2 className="text-2xl font-bold text-slate-800">Verifying your email...</h2>
                    <p className="text-slate-500">Please wait while we confirm your account.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-16 h-16 text-emerald-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Success!</h2>
                    <p className="text-slate-600 font-medium">{message}</p>
                    <p className="text-slate-500 text-sm">You can now access all features of Diet Desk.</p>
                    <button
                        onClick={onGoToLogin}
                        className="mt-6 flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 group"
                    >
                        Go to Login
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4">
                    <XCircle className="w-16 h-16 text-rose-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Verification Failed</h2>
                    <p className="text-rose-600 font-medium">{message}</p>
                    <p className="text-slate-500 text-sm">Try requesting a new link from your settings if you're already logged in.</p>
                    <button
                        onClick={onGoToLogin}
                        className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        Return to Login
                    </button>
                </div>
            )}
        </div>
    );
};

export default VerifyEmail;
