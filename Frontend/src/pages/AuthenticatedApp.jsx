import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import Step1PatientInfo from "../components/steps/Step1PatientInfo";
import Step2Calculations from "../components/steps/Step2Calculations";
import Step3MacroSetup from "../components/steps/Step3MacroSetup";
import Step4MealPlanner from "../components/steps/Step4MealPlanner";
import Step5WeeklyPlan from "../components/steps/Step5WeeklyPlan";
import Dashboard from "../components/Dashboard";
import PatientDetail from "../components/PatientDetail";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import Toast from "../components/ui/Toast";
import History from "../components/History";
import Patients from "../components/Patients";
import { useAuth } from "../context/AuthContext";
import { Box, Stack, Typography } from "@mui/material";
import Settings from "../components/Settings";
import PlaceholderPage from "../components/ui/PlaceholderPage";
import NutritionCalculators from "./NutritionCalculators";
import { FileText, Activity, UtensilsCrossed } from "lucide-react";

const PATH_TO_VIEW = {
    "/dashboard": "dashboard",
    "/patients": "patients",
    "/settings": "settings",
    "/planner": "planner",
    "/create-plan": "planner",
    "/plans": "plans",
    "/progress": "progress",
    "/food-database": "exchange-list",
    "/exchange-list": "exchange-list",
    "/history": "history",
    "/calculators": "calculators",
};

const VIEW_TO_PATH = {
    dashboard: "/dashboard",
    patients: "/patients",
    settings: "/settings",
    planner: "/planner",
    plans: "/plans",
    progress: "/progress",
    "exchange-list": "/food-database",
    history: "/history",
    calculators: "/calculators",
    profile: "/patients",
};

export default function AuthenticatedApp() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [view, setView] = useState("dashboard");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [patientData, setPatientData] = useState(null);
    const [patientId, setPatientId] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [macroTargets, setMacroTargets] = useState(null);
    const [weekPlan, setWeekPlan] = useState({
        Monday: { breakfast: [], snack: [], lunch: [], dinner: [] },
        Tuesday: { breakfast: [], snack: [], lunch: [], dinner: [] },
        Wednesday: { breakfast: [], snack: [], lunch: [], dinner: [] },
        Thursday: { breakfast: [], snack: [], lunch: [], dinner: [] },
        Friday: { breakfast: [], snack: [], lunch: [], dinner: [] },
        Saturday: { breakfast: [], snack: [], lunch: [], dinner: [] },
        Sunday: { breakfast: [], snack: [], lunch: [], dinner: [] },
    });
    const [currentDay, setCurrentDay] = useState("Monday");
    const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

    const showToast = useCallback((message, type = "info") => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
    }, []);

    useEffect(() => {
        const mapped = PATH_TO_VIEW[location.pathname];
        if (mapped) {
            setView(mapped);
            if (mapped !== "profile") {
                setSelectedPatient(null);
            }
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!user) return;
        const loginMessage = sessionStorage.getItem("dietdesk_login_success");
        if (loginMessage) {
            sessionStorage.removeItem("dietdesk_login_success");
            showToast(loginMessage, "success");
        }
    }, [user, showToast]);

    const handleError = (error) => {
        let msg = "Something went wrong";
        if (typeof error === "string") msg = error;
        else if (typeof error === "object") msg = JSON.stringify(error);
        showToast(msg, "error");
    };

    const handleSuccess = (msg) => showToast(msg, "success");

    const startNewPlan = () => {
        setPatientData(null);
        setPatientId(null);
        setMetrics(null);
        setMacroTargets(null);
        setCurrentStep(1);
        setView("planner");
        navigate("/create-plan");
    };

    const handleNavigate = (newView) => {
        if (newView === "create") {
            startNewPlan();
            return;
        }
        setView(newView);
        setSelectedPatient(null);
        navigate(VIEW_TO_PATH[newView] || "/dashboard");
    };

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const goToStep = (step) => {
        if (step >= 1 && step <= 5) setCurrentStep(step);
    };

    const nextStep = () => goToStep(currentStep + 1);
    const prevStep = () => goToStep(currentStep - 1);

    const handlePatientSaved = (profile) => {
        setPatientData(profile);
        setPatientId(profile.id);
        setMetrics({
            bmi: profile.bmi,
            bmr: profile.bmr,
            tdee: profile.tdee,
            assessment: profile.assessment || null,
        });
        showToast("Patient information saved", "success");
        nextStep();
    };

    const handleAssessmentExport = ({ metrics: exportedMetrics }) => {
        setMetrics(exportedMetrics);
        setCurrentStep(patientId ? 2 : 1);
        setView("planner");
        navigate("/create-plan");
        showToast(
            patientId
                ? "Assessment exported — review in step 2, then set macros"
                : "Save a patient in step 1 to attach this assessment to a diet plan",
            patientId ? "success" : "info"
        );
    };

    const handleProceedToMacros = () => nextStep();

    const handleMacrosConfirmed = (macros) => {
        setMacroTargets(macros);
        showToast("Macro targets set", "success");
        nextStep();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1PatientInfo onSave={handlePatientSaved} onError={handleError} initialData={patientData} />;
            case 2:
                return (
                    <Step2Calculations
                        metrics={metrics}
                        patientData={patientData}
                        onProceed={handleProceedToMacros}
                        onBack={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3MacroSetup
                        tdee={metrics?.tdee}
                        suggestedProtein={metrics?.assessment?.summary?.protein_g_per_day}
                        initialMacros={macroTargets}
                        onConfirm={handleMacrosConfirmed}
                        onBack={prevStep}
                    />
                );
            case 4:
                return (
                    <Step4MealPlanner
                        macroTargets={macroTargets}
                        weekPlan={weekPlan}
                        setWeekPlan={setWeekPlan}
                        currentDay={currentDay}
                        setCurrentDay={setCurrentDay}
                        onError={handleError}
                        onProceed={nextStep}
                        onBack={prevStep}
                    />
                );
            case 5:
                return (
                    <Step5WeeklyPlan
                        weekPlan={weekPlan}
                        macroTargets={macroTargets}
                        assessment={metrics?.assessment}
                        patientId={patientId}
                        patientData={patientData}
                        onError={handleError}
                        onSuccess={handleSuccess}
                        onBack={prevStep}
                        onStartOver={startNewPlan}
                    />
                );
            default:
                return null;
        }
    };

    const renderMainContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                </Box>
            );
        }

        if (view === "history") return <History onBack={() => handleNavigate("dashboard")} />;

        if (view === "dashboard") {
            return (
                <Dashboard
                    onCreatePlan={startNewPlan}
                    onAddPatient={() => {
                        setView("patients");
                        navigate("/patients?action=add");
                    }}
                    onSelectClient={(client) => {
                        setSelectedPatient(client);
                        setView("profile");
                    }}
                    onNavigate={handleNavigate}
                />
            );
        }

        if (view === "patients") {
            return (
                <Patients
                    onBack={() => handleNavigate("dashboard")}
                    onAddPatient={startNewPlan}
                    onSelectPatient={(client) => {
                        setSelectedPatient(client);
                        setView("profile");
                    }}
                />
            );
        }

        if (view === "exchange-list") {
            return (
                <PlaceholderPage
                    title="Food Database"
                    description="Food exchange search and clinic-wide reference tools are being prepared for a future release. Food selection inside the diet plan creator remains available for MVP plan building."
                    icon={UtensilsCrossed}
                />
            );
        }

        if (view === "plans") {
            return (
                <PlaceholderPage
                    title="Nutrition Protocols"
                    description="Review all active and historically assigned nutrition plans across your practice."
                    icon={FileText}
                />
            );
        }

        if (view === "progress") {
            return (
                <PlaceholderPage
                    title="Progress Tracking"
                    description="Monitor patient adherence, biometric trends, and clinical outcomes over time."
                    icon={Activity}
                />
            );
        }

        if (view === "settings") {
            return <Settings />;
        }

        if (view === "calculators") {
            return (
                <Box className="dd-mobile-page" sx={{ p: { xs: 0, md: 3 }, background: "var(--background)", minHeight: "100%" }}>
                    <NutritionCalculators onExportToPlan={handleAssessmentExport} />
                </Box>
            );
        }

        if (view === "profile" && selectedPatient) {
            return (
                <Box className="dd-mobile-page" p={{ xs: 2, md: 4 }}>
                    <PatientDetail
                        patient={selectedPatient}
                        onBack={() => handleNavigate("dashboard")}
                        onEditPlan={(p) => {
                            setPatientData(p);
                            setPatientId(p.id);
                            setMetrics({
                                bmi: p.bmi,
                                bmr: p.bmr,
                                tdee: p.tdee,
                                assessment: p.assessment || null,
                            });
                            setView("planner");
                            navigate("/planner");
                        }}
                    />
                </Box>
            );
        }

        if (view === "planner") {
            return (
                <Box className="dd-planner-page" sx={{ background: "var(--surface)", minHeight: "100%" }}>
                    <Box className="dd-planner-stepper-bar" sx={{ borderBottom: "1px solid var(--border)", background: "var(--background)", p: { xs: 0, md: 2 } }}>
                        <StepProgress currentStep={currentStep} onStepClick={goToStep} />
                    </Box>
                    <Box className="dd-planner-content" sx={{ maxWidth: "1000px", mx: "auto", p: { xs: 0, md: 4 } }}>
                        {renderStep()}
                    </Box>
                </Box>
            );
        }

        return (
            <Box p={4}>
                <Typography color="textSecondary">Section under development...</Typography>
            </Box>
        );
    };

    const protectedPaths = Object.keys(PATH_TO_VIEW);
    const isProfileView = view === "profile" && selectedPatient;
    if (!protectedPaths.includes(location.pathname) && !isProfileView) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Stack direction={{ xs: "column", lg: "row" }} sx={{ minHeight: "100vh", background: "var(--background)" }}>
            <Sidebar activeView={view} onNavigate={handleNavigate} onLogout={handleLogout} username={user.username} />

            <Box
                component="main"
                className="main-content dd-app-main page-content"
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    height: { xs: "auto", lg: "100vh" },
                    minHeight: { xs: "100dvh", lg: "100vh" },
                    position: "relative",
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                }}
            >
                {renderMainContent()}

                <MobileBottomNav />

                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.visible}
                    onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
                />
            </Box>
        </Stack>
    );
}
