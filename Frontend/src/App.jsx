import { useState, useCallback } from "react";
import StepProgress from "./components/StepProgress";
import Step1PatientInfo from "./components/steps/Step1PatientInfo";
import Step2Calculations from "./components/steps/Step2Calculations";
import Step3MacroSetup from "./components/steps/Step3MacroSetup";
import Step4MealPlanner from "./components/steps/Step4MealPlanner";
import Step5WeeklyPlan from "./components/steps/Step5WeeklyPlan";
import Dashboard from "./components/Dashboard";
import PatientDetail from "./components/PatientDetail";
import Sidebar from "./components/Sidebar";
import Toast from "./components/ui/Toast";
import Login from "./components/Login";
import Signup from "./components/Signup";
import History from "./components/History";
import Patients from "./components/Patients";
import { useAuth } from "./context/AuthContext";
import { Box, Stack, Typography } from "@mui/material";
import Settings from "./components/Settings";
import PlaceholderPage from "./components/ui/PlaceholderPage";
import { Users, FileText, Activity } from "lucide-react";

function App() {
    const { user, logout, loading } = useAuth();
    // View state ('dashboard', 'planner', 'profile', 'history', 'login', 'signup', 'patients', 'plans', 'progress', 'settings')
    const [view, setView] = useState('dashboard');
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Current step (1-5)
    const [currentStep, setCurrentStep] = useState(1);

    // Patient data flows through steps
    const [patientData, setPatientData] = useState(null);
    const [patientId, setPatientId] = useState(null);
    const [metrics, setMetrics] = useState(null); // BMI, BMR, TDEE
    const [macroTargets, setMacroTargets] = useState(null);

    // Week plan data
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

    // Toast notifications
    const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

    const showToast = useCallback((message, type = "info") => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
    }, []);

    const handleError = (error) => {
        let msg = "Something went wrong";
        if (typeof error === "string") msg = error;
        else if (typeof error === "object") msg = JSON.stringify(error);
        showToast(msg, "error");
    };

    const handleSuccess = (msg) => showToast(msg, "success");

    // Navigation logic that responds to sidebar
    const handleNavigate = (newView) => {
        if (newView === 'create') {
            startNewPlan();
        } else {
            setView(newView);
        }
        setSelectedPatient(null);
    };

    const startNewPlan = () => {
        setPatientData(null);
        setPatientId(null);
        setMetrics(null);
        setMacroTargets(null);
        setCurrentStep(1);
        setView('planner');
    };

    const goToStep = (step) => {
        if (step >= 1 && step <= 5) {
            setCurrentStep(step);
        }
    };

    const nextStep = () => goToStep(currentStep + 1);
    const prevStep = () => goToStep(currentStep - 1);

    const handlePatientSaved = (profile) => {
        setPatientData(profile);
        setPatientId(profile.id);
        setMetrics({ bmi: profile.bmi, bmr: profile.bmr, tdee: profile.tdee });
        showToast("Patient information saved", "success");
        nextStep();
    };

    const handleProceedToMacros = () => nextStep();

    const handleMacrosConfirmed = (macros) => {
        setMacroTargets(macros);
        showToast("Macro targets set", "success");
        nextStep();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1PatientInfo onSave={handlePatientSaved} onError={handleError} initialData={patientData} />;
            case 2: return <Step2Calculations metrics={metrics} onProceed={handleProceedToMacros} onBack={prevStep} />;
            case 3: return <Step3MacroSetup tdee={metrics?.tdee} initialMacros={macroTargets} onConfirm={handleMacrosConfirmed} onBack={prevStep} />;
            case 4: return <Step4MealPlanner macroTargets={macroTargets} weekPlan={weekPlan} setWeekPlan={setWeekPlan} currentDay={currentDay} setCurrentDay={setCurrentDay} onError={handleError} onProceed={nextStep} onBack={prevStep} />;
            case 5: return <Step5WeeklyPlan weekPlan={weekPlan} macroTargets={macroTargets} patientId={patientId} patientData={patientData} onError={handleError} onSuccess={handleSuccess} onBack={prevStep} onStartOver={startNewPlan} />;
            default: return null;
        }
    };

    const renderMainContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', h: '60vh' }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </Box>
            );
        }

        if (view === 'history') return <History onBack={() => setView('dashboard')} />;

        // Dashboard/Home
        if (view === 'dashboard') {
            return (
                <Dashboard
                    onCreatePlan={startNewPlan}
                    onSelectClient={(client) => {
                        setSelectedPatient(client);
                        setView('profile');
                    }}
                    onNavigate={handleNavigate}
                />
            );
        }

        // Functional Pages
        if (view === 'patients') {
            return (
                <Patients 
                    onBack={() => setView('dashboard')} 
                    onSelectPatient={(client) => {
                        setSelectedPatient(client);
                        setView('profile');
                    }} 
                />
            );
        }

        if (view === 'plans') {
            return <PlaceholderPage title="Nutrition Protocols" description="Review all active and historically assigned nutrition plans across your practice." icon={FileText} />;
        }

        if (view === 'progress') {
            return <PlaceholderPage title="Progress Tracking" description="Monitor patient adherence, biometric trends, and clinical outcomes over time." icon={Activity} />;
        }

        if (view === 'settings') {
            return <Settings />;
        }

        if (view === 'profile' && selectedPatient) {
            return (
                <Box p={{ xs: 2, md: 4 }}>
                    <PatientDetail
                        patient={selectedPatient}
                        onBack={() => setView('dashboard')}
                        onEditPlan={(p) => {
                            setPatientData(p);
                            setPatientId(p.id);
                            setMetrics({ bmi: p.bmi, bmr: p.bmr, tdee: p.tdee });
                            setView('planner');
                        }}
                    />
                </Box>
            );
        }

        if (view === 'planner') {
            return (
                <Box sx={{ background: 'var(--surface)', minHeight: '100vh' }}>
                    <Box sx={{ borderBottom: '1px solid var(--border)', background: 'var(--background)', p: 2, overflowX: 'auto' }}>
                        <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
                            <StepProgress currentStep={currentStep} onStepClick={goToStep} />
                        </Box>
                    </Box>
                    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: { xs: 2, md: 4 } }}>{renderStep()}</Box>
                </Box>
            );
        }

        return <Box p={4}><Typography color="textSecondary">Section under development...</Typography></Box>;
    };

    if (!user && !loading) {
        return (
            <Box className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4">
                {view === 'signup' ? <Signup onToggle={() => setView('login')} /> : <Login onToggle={() => setView('signup')} />}
                <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={() => setToast((prev) => ({ ...prev, visible: false }))} />
            </Box>
        );
    }

    return (
        <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ minHeight: '100vh', background: 'var(--background)' }}>
            {user && (
                <Sidebar 
                    activeView={view} 
                    onNavigate={handleNavigate} 
                    onLogout={logout} 
                    username={user.username} 
                />
            )}
            
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', height: '100vh', position: 'relative' }}>
                {renderMainContent()}
                
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

export default App;
