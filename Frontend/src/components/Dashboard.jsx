import { useState, useEffect } from "react";
import {
    Users,
    Calendar,
    FileText,
    Plus,
    ChevronRight,
    Utensils,
    Target,
    TrendingUp
} from "lucide-react";
import ReminderManager from "./ReminderManager";
import ReflectionLog from "./ReflectionLog";
import ConsistencyPulse from "./ConsistencyPulse";
import EmptyPlanState from "./EmptyPlanState";
import MealPlanUpload from "./MealPlanUpload";
import DaySelector from "./DaySelector";
import DailyProgressHeader from "./DailyProgressHeader";
import MealChecklistCard from "./MealChecklistCard";
import { mockTransformUploadedMealPlan } from "../utils/mealPlanTransformer";
import { getPatients } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Box, Paper, Stack, Typography } from "@mui/material";

export default function Dashboard({ onCreatePlan, onSelectClient }) {
    const { user } = useAuth();
    const role = user?.role || "client";
    const [activeClients, setActiveClients] = useState([]);
    const [loading, setLoading] = useState(role === "dietitian");

    useEffect(() => {
        if (role === "dietitian") {
            const fetchPatients = async () => {
                const response = await getPatients();
                if (response.success && Array.isArray(response.data)) {
                    setActiveClients(response.data);
                }
                setLoading(false);
            };
            fetchPatients();
        } else {
            setLoading(false);
        }
    }, [role]);

    const todayFollowUps = [
        { time: "09:30 AM", client: "Maria Garcia", objective: "Weekly Review" },
        { time: "11:00 AM", client: "David Smith", objective: "Initial Assessment" },
    ];

    const [mealPlan, setMealPlan] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);
    const [uploadFile, setUploadFile] = useState(null);
    const [showUploadField, setShowUploadField] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const selectedDayPlan = mealPlan?.days?.[selectedDay] ?? null;
    const totalMeals = selectedDayPlan?.meals?.length ?? 0;
    const completedMeals = selectedDayPlan?.meals?.filter((meal) => meal.completed).length ?? 0;

    const handleFileSelect = (file) => {
        setUploadFile(file);
        setUploadError("");
    };

    const handleUploadPlan = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        setUploadError("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const transformed = mockTransformUploadedMealPlan(uploadFile);
            setMealPlan(transformed);
            setSelectedDay(0);
            setUploadFile(null);
            setShowUploadField(false);
        } catch (error) {
            setUploadError("Unable to convert the selected file. Please try another PDF.");
        } finally {
            setIsUploading(false);
        }
    };

    const toggleMealCompleted = (mealId) => {
        setMealPlan((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map((day, index) => {
                    if (index !== selectedDay) return day;
                    return {
                        ...day,
                        meals: day.meals.map((meal) =>
                            meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
                        ),
                    };
                }),
            };
        });
    };

    const planSection = (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 5 }, bgcolor: "background.paper" }}>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.18em" }}>
                        Today's Nutrition Plan
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
                        Meal plan tracker
                    </Typography>
                </Box>

                {!mealPlan ? (
                    <Stack spacing={3}>
                        <EmptyPlanState onUploadClick={() => setShowUploadField(true)} />
                        {showUploadField && (
                            <MealPlanUpload
                                file={uploadFile}
                                onFileSelect={handleFileSelect}
                                onUpload={handleUploadPlan}
                                disabled={isUploading}
                            />
                        )}
                        {uploadError && (
                            <Typography variant="body2" color="error">
                                {uploadError}
                            </Typography>
                        )}
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        <DaySelector days={mealPlan.days} selectedIndex={selectedDay} onChange={setSelectedDay} />
                        <DailyProgressHeader
                            completed={completedMeals}
                            total={totalMeals}
                            planTitle={mealPlan.planTitle}
                            dayLabel={selectedDayPlan?.dayLabel ?? ""}
                        />
                        <Stack spacing={3}>
                            {selectedDayPlan?.meals?.map((meal) => (
                                <MealChecklistCard key={meal.id} meal={meal} onToggleComplete={toggleMealCompleted} />
                            ))}
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );

    const [progressStats, setProgressStats] = useState([
        { label: "Calories", current: 1250, target: 1800, unit: "kcal", color: "bg-emerald-500" },
        { label: "Water", current: 1.5, target: 2.5, unit: "L", color: "bg-blue-500" },
        { label: "Steps", current: 6400, target: 10000, unit: "steps", color: "bg-amber-500" },
    ]);

    const updateProgress = (index, newValue) => {
        setProgressStats(prev => prev.map((stat, i) =>
            i === index ? { ...stat, current: Math.max(0, newValue) } : stat
        ));
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 font-sans">
            {role === "dietitian" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Center: Main Management */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight uppercase">DIETDESK</h1>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Clinic Operations Feed</p>
                            </div>
                            <button
                                onClick={onCreatePlan}
                                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-5 py-2.5 rounded-sm font-bold text-xs md:text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none w-full sm:w-auto"
                            >
                                <Plus size={18} />
                                CREATE NEW PLAN
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                                Indexing Clinical Data...
                            </div>
                        )}

                        {!loading && (
                            <>
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <div className="bg-white border border-emerald-900/10 p-4 md:p-5 rounded-sm shadow-sm flex items-center gap-3 md:gap-4">
                                        <div className="bg-emerald-50 p-2 md:p-3 rounded-sm text-emerald-600">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clients</p>
                                            <p className="text-xl md:text-2xl font-black text-emerald-900">{activeClients.length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-blue-900/10 p-4 md:p-5 rounded-sm shadow-sm flex items-center gap-3 md:gap-4">
                                        <div className="bg-blue-50 p-2 md:p-3 rounded-sm text-blue-600">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
                                            <p className="text-xl md:text-2xl font-black text-blue-900">3</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-amber-900/10 p-4 md:p-5 rounded-sm shadow-sm flex items-center gap-3 md:gap-4 col-span-2 md:col-span-1">
                                        <div className="bg-amber-50 p-2 md:p-3 rounded-sm text-amber-600">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</p>
                                            <p className="text-xl md:text-2xl font-black text-amber-900">92%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Clients Table */}
                                <div className="bg-white border border-emerald-900/10 rounded-sm shadow-sm overflow-hidden">
                                    <div className="p-4 md:p-5 border-b border-emerald-50 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-emerald-900">Patient Database</h3>
                                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400">{activeClients.length} RECORDS</span>
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                                                    <th className="px-6 py-4">Patient</th>
                                                    <th className="px-6 py-4">Goal</th>
                                                    <th className="px-6 py-4 text-center">BMI</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-emerald-50 text-sm">
                                                {activeClients.map((client) => (
                                                    <tr key={client.id} onClick={() => onSelectClient(client)} className="hover:bg-emerald-50/50 transition-colors cursor-pointer group">
                                                        <td className="px-6 py-4 font-bold text-gray-800">
                                                            {client.name}
                                                            <span className="block text-[10px] text-gray-400 font-medium">{client.gender} • {client.age}y</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium uppercase text-xs tracking-tight">{client.goal}</td>
                                                        <td className="px-6 py-4 text-center font-black text-emerald-700">{client.bmi || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Live</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <ChevronRight size={18} className="text-emerald-900 opacity-20 group-hover:opacity-100" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-emerald-50">
                                        {activeClients.map((client) => (
                                            <div key={client.id} onClick={() => onSelectClient(client)} className="p-4 flex items-center justify-between active:bg-emerald-50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">{client.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{client.goal}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span className="text-[10px] font-black text-emerald-600">BMI {client.bmi || '-'}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300" />
                                            </div>
                                        ))}
                                        {activeClients.length === 0 && (
                                            <div className="p-10 text-center text-xs text-gray-400 italic">No patients found.</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Sidebar Activity/Reminders */}
                    <div className="space-y-6">
                        <ReminderManager role={role} />

                        <div className="bg-white border-2 border-emerald-900/10 p-6 rounded-sm shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 -mr-12 -mt-12 rounded-full opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6 text-emerald-900 border-b-2 border-emerald-50 pb-3">
                                    <Calendar size={18} />
                                    <h3 className="font-black text-xs uppercase tracking-widest">Clinic Schedule</h3>
                                </div>
                                <div className="space-y-4">
                                    {todayFollowUps.map((meeting, i) => (
                                        <div key={i} className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-sm transition-colors border-l-2 border-transparent hover:border-emerald-500">
                                            <div className="text-center min-w-[50px]">
                                                <p className="text-xs font-black text-emerald-700">{meeting.time.split(' ')[0]}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{meeting.time.split(' ')[1]}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{meeting.client}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{meeting.objective}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-900 p-6 rounded-sm shadow-lg text-white">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">Session Summary</h3>
                            <p className="text-sm font-medium leading-relaxed">
                                You have <span className="text-emerald-400 font-bold underline">3 assessments</span> pending for the high-priority metabolic group today.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* CLIENT DASHBOARD */
                /* ... (keeping client board similar but could also push to real data if goals/meals were dynamic) */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="text-center py-4">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Hi {user?.username || 'Client'}!</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Welcome to your health dashboard</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {progressStats.map((stat, i) => (
                                <div key={i} className="bg-white border-2 border-emerald-900/10 p-6 rounded-sm shadow-sm hover:translate-y-[-2px] transition-all">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <button
                                            onClick={() => updateProgress(i, stat.current - (stat.label === 'Water' ? 0.1 : 50))}
                                            className="text-lg font-bold text-gray-400 hover:text-gray-600"
                                        >
                                            -
                                        </button>
                                        <p className="text-2xl font-black text-emerald-900">{stat.current}</p>
                                        <button
                                            onClick={() => updateProgress(i, stat.current + (stat.label === 'Water' ? 0.1 : 50))}
                                            className="text-lg font-bold text-gray-400 hover:text-gray-600"
                                        >
                                            +
                                        </button>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ {stat.target} {stat.unit}</p>
                                    </div>
                                    <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stat.color} transition-all duration-700 ease-out`}
                                            style={{ width: `${Math.min(100, (stat.current / stat.target) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border-2 border-emerald-900/10 p-6 rounded-sm shadow-sm">
                            <ConsistencyPulse role="client" />
                        </div>

                        <div className="bg-white border-2 border-emerald-900/10 p-6 rounded-sm shadow-sm">
                            <ReflectionLog role="client" patientId={activeClients[0]?.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
