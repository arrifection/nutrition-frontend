import React, { useState, useEffect, useCallback } from "react";
import { Clock, PlusCircle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "./ui/EmptyState";
import ApiErrorState from "./ui/ApiErrorState";

const History = ({ onBack, onCreatePlan }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/history/list");
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
            setError("Couldn't load your activity history. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="dd-mobile-page max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-emerald-900 tracking-tight">My Records</h2>
                    <p className="text-emerald-600 font-medium mt-1">Activity history for {user?.username}</p>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 border border-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                </div>
            ) : error ? (
                <div className="dd-card">
                    <ApiErrorState message={error} onRetry={fetchHistory} />
                </div>
            ) : history.length === 0 ? (
                <div className="dd-card">
                    <EmptyState
                        icon={Clock}
                        title="No activity yet"
                        description="Your saved plans, assessments, and clinical actions will appear here as you use DietDesk."
                        actionLabel="Create a diet plan"
                        onAction={onCreatePlan}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((entry) => (
                        <div key={entry._id} className="bg-white rounded-2xl border border-emerald-50 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            entry.activity_type.includes("BMI") ? "bg-blue-50 text-blue-600" :
                                            entry.activity_type.includes("Macros") ? "bg-emerald-50 text-emerald-600" :
                                            "bg-purple-50 text-purple-600"
                                        }`}>
                                            {entry.activity_type}
                                        </span>
                                        <span className="text-[11px] font-semibold text-gray-400">
                                            {formatDate(entry.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 font-medium">
                                        {entry.details?.patient ? `Patient: ${entry.details.patient}` : "Clinical activity recorded"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
