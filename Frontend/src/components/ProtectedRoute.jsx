import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "./ui/AuthLoadingScreen";

export default function ProtectedRoute({ children }) {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return <AuthLoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
}
