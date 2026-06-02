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
import LegalPage from "./pages/LegalPage";
import Toast from "./components/ui/Toast";
import DietDeskLogo from "./components/DietDeskLogo";
import ProtectedRoute from "./components/ProtectedRoute";
import FullPageSpinner from "./components/ui/FullPageSpinner";

function RootRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <FullPageSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

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

    if (loading) return <FullPageSpinner />;
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

    if (loading) return <FullPageSpinner />;
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

    if (loading) return <FullPageSpinner />;

    return (
        <Box className="verify-page-wrap auth-page-wrap min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4">
            <AuthHomeLink idPrefix="auth-verify" />
            <VerifyEmail onGoToLogin={() => navigate(user ? "/dashboard" : "/login")} />
        </Box>
    );
}

function PrivateApp() {
    return (
        <ProtectedRoute>
            <AuthenticatedApp />
        </ProtectedRoute>
    );
}

function CatchAllRoute() {
    const { user, loading } = useAuth();
    if (loading) return <FullPageSpinner />;
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
            <Route
                path="/privacy"
                element={
                    <LegalPage
                        title="Privacy Policy"
                        description="Our privacy policy is being finalized. Check back soon for full details on how DietDesk handles your data."
                    />
                }
            />
            <Route
                path="/terms"
                element={
                    <LegalPage
                        title="Terms of Service"
                        description="Our terms of service are being finalized. Check back soon for the complete agreement."
                    />
                }
            />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<PrivateApp />} />
            <Route path="/patients" element={<PrivateApp />} />
            <Route path="/settings" element={<PrivateApp />} />
            <Route path="/planner" element={<PrivateApp />} />
            <Route path="/create-plan" element={<PrivateApp />} />
            <Route path="/plans" element={<PrivateApp />} />
            <Route path="/progress" element={<PrivateApp />} />
            <Route path="/food-database" element={<PrivateApp />} />
            <Route path="/exchange-list" element={<PrivateApp />} />
            <Route path="/history" element={<PrivateApp />} />
            <Route path="*" element={<CatchAllRoute />} />
        </Routes>
    );
}
