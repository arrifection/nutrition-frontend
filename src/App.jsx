import { useState, useCallback } from "react";
import StepProgress from "./components/StepProgress";
import Step1PatientInfo from "./components/steps/Step1PatientInfo";
import Step2Calculations from "./components/steps/Step2Calculations";
import Step3MacroSetup from "./components/steps/Step3MacroSetup";
import Step4MealPlanner from "./components/steps/Step4MealPlanner";
import Step5WeeklyPlan from "./components/steps/Step5WeeklyPlan";
import Dashboard from "./components/Dashboard";
import PatientDetail from "./components/PatientDetail";
import GoalManager from "./components/GoalManager";
import ReminderManager from "./components/ReminderManager";
import Toast from "./components/ui/Toast";

function App() {
    // View state ('dashboard', 'planner', or 'profile')
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

    // Navigation
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

    // Step 1 completion: patient info saved
    const handlePatientSaved = (profile) => {
        setPatientData(profile);
        setPatientId(profile.id);
        setMetrics({
            bmi: profile.bmi,
            bmr: profile.bmr,
            tdee: profile.tdee,
        });
        showToast("Patient information saved", "success");
        nextStep();
    };

    // Step 2 -> Step 3
    const handleProceedToMacros = () => {
        nextStep();
    };

    // Step 3 completion: macros confirmed
    const handleMacrosConfirmed = (macros) => {
        setMacroTargets(macros);
        showToast("Macro targets set", "success");
        nextStep();
    };

    // Render current step
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1PatientInfo
                        onSave={handlePatientSaved}
                        onError={handleError}
                        initialData={patientData}
                    />
                );
            case 2:
                return (
                    <Step2Calculations
                        metrics={metrics}
                        onProceed={handleProceedToMacros}
                        onBack={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3MacroSetup
                        tdee={metrics?.tdee}
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

    // View Switching Logic
    const renderMainContent = () => {
        if (view === 'dashboard') {
            return (
                <main className="bg-gray-50/50 min-h-[calc(100vh-72px)] py-8">
                    <Dashboard
                        onCreatePlan={startNewPlan}
                        onSelectClient={(client) => {
                            setSelectedPatient(client);
                            setView('profile');
                        }}
                    />
                </main>
            );
        }

        if (view === 'profile' && selectedPatient) {
            return (
                <main className="max-w-6xl mx-auto px-6 py-8">
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
                </main>
            );
        }

        return (
            <div className="bg-white">
                <div className="border-b border-emerald-100 bg-emerald-50/30 no-print">
                    <div className="max-w-5xl mx-auto px-6 py-4">
                        <StepProgress currentStep={currentStep} onStepClick={goToStep} />
                    </div>
                </div>
                <main className="max-w-5xl mx-auto px-6 py-8">{renderStep()}</main>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-emerald-200 bg-white no-print sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-bold text-emerald-800 tracking-tight cursor-pointer" onClick={() => { setView('dashboard'); setSelectedPatient(null); }}>
                                NUTRI<span className="text-emerald-500">PRO</span>
                            </h1>
                            <div className="h-6 w-px bg-emerald-100 hidden md:block"></div>
                            <p className="text-xs text-gray-500 hidden md:block font-medium uppercase tracking-widest">Clinical Dietetics v1.0</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {view !== 'dashboard' && (
                                <button
                                    onClick={() => { setView('dashboard'); setSelectedPatient(null); }}
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1 rounded-sm hover:bg-emerald-50"
                                >
                                    Dashboard
                                </button>
                            )}

                            {patientData && view === 'planner' && (
                                <div className="text-right border-l border-emerald-100 pl-4">
                                    <p className="text-sm font-bold text-gray-800 leading-none">
                                        {patientData.name}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">
                                        {patientData.gender} • {patientData.age} yr
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {renderMainContent()}

            <footer className="border-t border-emerald-50 bg-white no-print py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            © 2026 NutriPro Systems • Professional Grade
                        </p>
                        <div className="flex gap-6">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-pointer hover:text-emerald-600">Privacy</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-pointer hover:text-emerald-600">Support</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-pointer hover:text-emerald-600">Terms</span>
                        </div>
                    </div>
                </div>
            </footer>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
        </div>
    );
}

export default App;
