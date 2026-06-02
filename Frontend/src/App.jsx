import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import AuthenticatedApp from "./pages/AuthenticatedApp";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import PdfPreview from "./pages/PdfPreview";
import Toast from "./components/ui/Toast";
import DietDeskLogo from "./components/DietDeskLogo";

function LoadingScreen() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </Box>
    );
}

function LandingRoute() {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;
    return <Landing />;
}

function AuthHomeLink({ idPrefix }) {
    return (
        <Link to="/" className="auth-home-link" aria-label="Back to DietDesk home">
            <DietDeskLogo idPrefix={idPrefix} />
        </Link>
    );
}

function LoginPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;

    const from = location.state?.from || "/dashboard";

    return (
        <Box className="auth-page-wrap min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4">
            <AuthHomeLink idPrefix="auth-login" />
            <Login
                onToggle={() => navigate("/signup")}
                onSuccess={() => navigate(from, { replace: true })}
            />
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
        </Box>
    );
}

function SignupPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <Box className="auth-page-wrap min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4">
            <AuthHomeLink idPrefix="auth-signup" />
            <Signup onToggle={() => navigate("/login")} />
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
        </Box>
    );
}

function VerifyEmailPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return <LoadingScreen />;

    return (
        <Box className="verify-page-wrap auth-page-wrap min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4">
            <AuthHomeLink idPrefix="auth-verify" />
            <VerifyEmail onGoToLogin={() => navigate(user ? "/dashboard" : "/login")} />
        </Box>
    );
}

function ProtectedCatchAll() {
    return <AuthenticatedApp />;
}

function CatchAllRoute() {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
}

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isVerifyPath = location.pathname.includes("verify-email");
        if (params.get("token") && !isVerifyPath) {
            navigate(`/verify-email${location.search}`, { replace: true });
        }
    }, [location.search, location.pathname, navigate]);

    return (
        <Routes>
            <Route path="/pdf-preview" element={<PdfPreview />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/" element={<LandingRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedCatchAll />} />
            <Route path="/patients" element={<ProtectedCatchAll />} />
            <Route path="/settings" element={<ProtectedCatchAll />} />
            <Route path="/planner" element={<ProtectedCatchAll />} />
            <Route path="/plans" element={<ProtectedCatchAll />} />
            <Route path="/progress" element={<ProtectedCatchAll />} />
            <Route path="/food-database" element={<ProtectedCatchAll />} />
            <Route path="/exchange-list" element={<ProtectedCatchAll />} />
            <Route path="/history" element={<ProtectedCatchAll />} />
            <Route path="*" element={<CatchAllRoute />} />
        </Routes>
    );
}
