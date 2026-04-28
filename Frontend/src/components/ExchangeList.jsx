import { useState, useEffect, useMemo } from "react";
import Card from "./ui/Card";
import { getExchangeList } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ShieldCheck, AlertCircle } from "lucide-react";

// Exchange value metadata per group/subgroup (English keys for internal lookup)
const EXCHANGE_VALUES = {
    "Starches": { carbs: 15, protein: 3, fat: "0-1", calories: 80 },
    "Fruits": { carbs: 15, protein: 0, fat: 0, calories: 60 },
    "Milk|Fat-free and Low-fat": { carbs: 12, protein: 8, fat: "0-3", calories: 100 },
    "Milk|Reduced-Fat": { carbs: 12, protein: 8, fat: 5, calories: 120 },
    "Milk|Whole Milk": { carbs: 12, protein: 8, fat: 8, calories: 160 },
    "Vegetables": { carbs: 5, protein: 2, fat: 0, calories: 25 },
    "Meat|Lean Meat and Substitutes": { carbs: 0, protein: 7, fat: "0-3", calories: 45 },
    "Meat|Medium-Fat Meat and Substitutes": { carbs: 0, protein: 7, fat: "4-7", calories: 75 },
    "Meat|High-Fat Meat and Substitutes": { carbs: 0, protein: 7, fat: "8+", calories: 100 },
    "Meat|Plant-Based Protein": { carbs: 7, protein: 7, fat: "varies", calories: "varies" },
    "Fats": { carbs: 0, protein: 0, fat: 5, calories: 45 },
};

function getExchangeValue(group, subgroup) {
    const key = `${group}|${subgroup}`;
    return EXCHANGE_VALUES[key] || EXCHANGE_VALUES[group] || null;
}

export default function ExchangeList({ onError, onAddFood, patientLanguage = "en", isAdmin = false }) {
    const [allFoods, setAllFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [searchTerm, setSearchTerm] = useState("");
    const [openSections, setOpenSections] = useState({});
    const [currentLanguage, setCurrentLanguage] = useState(patientLanguage);

    useEffect(() => {
        fetchExchangeList();
    }, []);

    const fetchExchangeList = async () => {
        setLoading(true);
        setError(null);
        const response = await getExchangeList(null);
        if (response.success) {
            setAllFoods(response.data.items);
            if (response.data.items.length > 0) {
                setOpenSections({ "Starches": true });
            }
        } else {
            setError(response.error);
            onError?.(response.error);
        }
        setLoading(false);
    };

    const meals = [
        { value: "breakfast", label: "Breakfast", icon: "🌅" },
        { value: "snack", label: "Snack", icon: "🍎" },
        { value: "lunch", label: "Lunch", icon: "☀️" },
        { value: "dinner", label: "Dinner", icon: "🌙" }
    ];

    const getGroupColor = (group) => {
        const colors = {
            "Starches": "bg-orange-50 border-orange-200 text-orange-900",
            "Fruits": "bg-pink-50 border-pink-200 text-pink-900",
            "Milk": "bg-blue-50 border-blue-200 text-blue-900",
            "Vegetables": "bg-green-50 border-green-200 text-green-900",
            "Meat": "bg-red-50 border-red-200 text-red-900",
            "Fats": "bg-yellow-50 border-yellow-200 text-yellow-900",
            "Sweets": "bg-purple-50 border-purple-200 text-purple-900"
        };
        return colors[group] || "bg-gray-50 border-primary-200 text-primary-900";
    };

    const getGroupIcon = (group) => {
        const icons = {
            "Starches": "🍞",
            "Fruits": "🍇",
            "Milk": "🥛",
            "Vegetables": "🥦",
            "Meat": "🥩",
            "Fats": "🥑",
            "Sweets": "🍰"
        };
        return icons[group] || "🍽️";
    };

    const getDisplayName = (food) => {
        if (isAdmin) {
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-primary-900">{food.food_name.en}</span>
                    {food.food_name.ur_clinical && (
                        <span className="text-[10px] text-primary-400 font-urdu">{food.food_name.ur_clinical}</span>
                    )}
                </div>
            );
        }
        if (currentLanguage === "ur") {
            return <span className="font-bold text-primary-900 font-urdu">{food.food_name.ur_patient || food.food_name.en}</span>;
        }
        return <span className="font-bold text-primary-900">{food.food_name.en}</span>;
    };

    const toggleSection = (group) => {
        setOpenSections(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const groupedFoods = useMemo(() => {
        if (!allFoods || allFoods.length === 0) return {};

        const filtered = allFoods.filter(f => {
            if (!f.food_name || !f.group) return false;

            // Only show approved items in Urdu patient view if specified by rules
            if (currentLanguage === "ur" && !isAdmin && f.translation_status !== "approved") {
                return false;
            }

            const search = searchTerm.toLowerCase();
            const nameEn = (f.food_name.en || "").toLowerCase();
            const groupEn = (f.group.en || "").toLowerCase();
            const subEn = (f.subcategory?.en || "").toLowerCase();
            const urClin = (f.food_name.ur_clinical || "");

            return (
                nameEn.includes(search) ||
                urClin.includes(searchTerm) ||
                groupEn.includes(search) ||
                subEn.includes(search)
            );
        });

        const groupOrder = ["Starches", "Fruits", "Milk", "Vegetables", "Sweets", "Meat", "Fats", "Other"];
        const groups = {};
        groupOrder.forEach(g => groups[g] = {});

        filtered.forEach(item => {
            const g = item.group?.en || "Other";
            const sg = item.subcategory?.en || "General";
            if (!groups[g]) groups[g] = {};
            if (!groups[g][sg]) groups[g][sg] = [];
            groups[g][sg].push(item);
        });

        // Remove empty groups and empty subcategories
        const finalGroups = {};
        Object.keys(groups).forEach(gKey => {
            const subcats = groups[gKey];
            const hasItems = Object.values(subcats).some(arr => arr.length > 0);
            if (hasItems) {
                finalGroups[gKey] = subcats;
            }
        });

        return finalGroups;
    }, [allFoods, searchTerm, currentLanguage, isAdmin]);

    const countGroupItems = (subgroups) => {
        return Object.values(subgroups).reduce((sum, items) => sum + items.length, 0);
    };

    return (
        <Card
            title={currentLanguage === 'ur' ? 'فوڈ ایکسچینج لسٹ' : 'Food Exchange List'}
            description={currentLanguage === 'ur' ? 'گروپس کے لحاظ سے ترتیب دیا گیا فوڈ ڈیٹا بیس' : 'Comprehensive food database sorted by groups — Clinical Reference'}
            className="w-full"
        >
            {/* Controls Header */}
            <div className="flex flex-col gap-6 mb-6 bg-beige-50 p-4 border-2 border-primary-900/10">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
                    {/* Meal Selector */}
                    <div className="flex-1">
                        <label className="block text-xs font-black text-primary-900 uppercase tracking-widest mb-2">
                            {currentLanguage === 'ur' ? 'آئٹم کا اضافہ:' : 'Adding items to:'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {meals.map(meal => (
                                <button
                                    key={meal.value}
                                    onClick={() => setSelectedMeal(meal.value)}
                                    className={`px-4 py-2 text-sm font-bold uppercase border-2 transition-all flex items-center gap-2 ${selectedMeal === meal.value
                                        ? "bg-primary-600 text-white border-primary-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        : "bg-white text-primary-900 border-primary-900 hover:bg-beige-100 hover:translate-y-[-1px]"
                                        }`}
                                >
                                    <span>{meal.icon}</span>
                                    {meal.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language & Search */}
                    <div className="flex gap-4 items-end w-full md:w-auto">
                        <div className="flex-1 md:w-64">
                            <label className="block text-xs font-black text-primary-900 uppercase tracking-widest mb-2">
                                {currentLanguage === 'ur' ? 'تلاش کریں' : 'Search Foods'}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={currentLanguage === 'ur' ? 'مثلاً سیب، چاول...' : 'e.g. Apple, Rice, Steak...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border-2 border-primary-900 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:font-normal"
                                />
                                <span className="absolute right-3 top-2.5 opacity-50">🔍</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentLanguage(prev => prev === "en" ? "ur" : "en")}
                            className="p-2 border-2 border-primary-900 bg-white hover:bg-beige-100 transition-all flex items-center gap-2 font-bold text-xs uppercase"
                            title="Switch Language"
                        >
                            <Globe size={16} />
                            {currentLanguage === "en" ? "اردو" : "EN"}
                        </button>
                    </div>
                </div>

                {/* Admin/Clinical Status Legend (Only in Admin view) */}
                {isAdmin && (
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-primary-900/10">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-600">
                            <ShieldCheck size={14} /> Approved Translation
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-600">
                            <AlertCircle size={14} /> Draft / Needs Review
                        </div>
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border-2 border-red-500 p-6 mb-6">
                    <div className="flex items-center gap-3 text-red-700 mb-4">
                        <AlertCircle size={24} />
                        <h3 className="font-black uppercase tracking-tight text-lg">Connection Error</h3>
                    </div>
                    <p className="text-sm font-bold text-red-600 mb-4 font-mono bg-white p-3 border border-red-200">
                        {error}
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchExchangeList}
                            className="px-6 py-2 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            🔄 Try Again
                        </button>
                        <div className="text-[10px] text-red-400 font-bold uppercase max-w-xs leading-tight">
                            Tip: Make sure your Python backend is running at http://127.0.0.1:8000
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-primary-700 font-bold uppercase tracking-widest">Loading database...</p>
                </div>
            )}

            {/* Food Groups Accordion */}
            {!loading && (
                <div className="space-y-4">
                    {Object.keys(groupedFoods).map((group) => (
                        <div key={group} className="border-2 border-primary-900 bg-white">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleSection(group)}
                                className={`w-full flex items-center justify-between p-4 ${getGroupColor(group)} hover:brightness-95 transition-all text-left group`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{getGroupIcon(group)}</span>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">
                                            {(() => {
                                                if (currentLanguage === 'ur') {
                                                    const subcats = Object.values(groupedFoods[group]);
                                                    const firstItem = subcats[0]?.[0];
                                                    return firstItem?.group?.ur || group;
                                                }
                                                return group;
                                            })()}
                                        </h3>
                                        <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                                            {countGroupItems(groupedFoods[group])} items · {Object.keys(groupedFoods[group]).length} subcategories
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-2xl transition-transform duration-300 ${openSections[group] ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {/* Group Content */}
                            <AnimatePresence>
                                {openSections[group] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 space-y-8">
                                            {Object.entries(groupedFoods[group]).map(([subgroup, foods]) => {
                                                const exchVal = getExchangeValue(group, subgroup);
                                                return (
                                                    <div key={subgroup} className="relative">
                                                        {/* Subgroup Heading */}
                                                        <div className="mb-4">
                                                            <h4 className="text-sm font-black text-primary-900 uppercase tracking-widest border-b-2 border-primary-200 pb-1 mb-1">
                                                                {subgroup}
                                                            </h4>
                                                            {exchVal && (
                                                                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-tighter">
                                                                    Serving = <span className="text-blue-700">{exchVal.carbs}g C</span> | <span className="text-emerald-700">{exchVal.protein}g P</span> | <span className="text-amber-700">{exchVal.fat}g F</span> | <span className="text-primary-900">{exchVal.calories} Cal</span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Table */}
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full min-w-[600px]">
                                                                <thead className="text-[10px] uppercase tracking-widest text-primary-400 border-b-2 border-primary-100">
                                                                    <tr>
                                                                        <th className="pb-2 text-left w-1/3">Name</th>
                                                                        <th className="pb-2 text-left">Portion</th>
                                                                        {isAdmin && <th className="pb-2 text-center">Status</th>}
                                                                        <th className="pb-2 text-center">C / P / F</th>
                                                                        <th className="pb-2 text-center">Cals</th>
                                                                        <th className="pb-2 text-right">Add</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-primary-100">
                                                                    {foods.map((food, idx) => (
                                                                        <tr key={idx} className="group/row hover:bg-beige-50 transition-colors">
                                                                            <td className="py-3">
                                                                                {getDisplayName(food)}
                                                                                {isAdmin && <span className="block text-[8px] text-primary-300 font-mono mt-0.5">{food.id}</span>}
                                                                            </td>
                                                                            <td className="py-3 text-sm text-primary-600 font-medium">
                                                                                {currentLanguage === "ur" ? (food.food_name.ur_patient?.split(" ").slice(-1)[0] === food.serving_size ? food.food_name.ur_patient : food.serving_size) : food.serving_size}
                                                                            </td>
                                                                            {isAdmin && (
                                                                                <td className="py-3 text-center">
                                                                                    <div className={`inline-flex p-1 rounded-full ${food.translation_status === 'approved' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                                                                        {food.translation_status === 'approved' ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                                                                                    </div>
                                                                                </td>
                                                                            )}
                                                                            <td className="py-3 text-center text-xs font-bold text-primary-400">
                                                                                {food.macros.carbs_g} / {food.macros.protein_g} / {food.macros.fat_g}
                                                                            </td>
                                                                            <td className="py-3 text-center font-black text-primary-900">{food.macros.calories}</td>
                                                                            <td className="py-3 text-right">
                                                                                <button
                                                                                    onClick={() => onAddFood?.(selectedMeal, food)}
                                                                                    className="px-3 py-1 bg-primary-900 text-white text-[10px] font-black uppercase tracking-tighter hover:bg-primary-700 transition-all opacity-0 group-hover/row:opacity-100 transform translate-x-2 group-hover/row:translate-x-0"
                                                                                >
                                                                                    + Add
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}

            {/* Daily Exchange Summary Section */}
            <div className="mt-12 pt-8 border-t-4 border-primary-900/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-primary-900 uppercase tracking-tight">
                        {currentLanguage === 'ur' ? 'روزانہ ایکسچینج سمری' : 'Daily Exchange Summary'}
                    </h2>
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest bg-beige-100 px-3 py-1 border border-primary-200">
                        Dietitian Use Only
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { en: "Starches", ur: "نشاستہ دار غذائیں" },
                        { en: "Fruits", ur: "پھل" },
                        { en: "Milk/Yogurt", ur: "دودھ اور دہی" },
                        { en: "Non-Starchy Vegetables", ur: "بغیر نشاستہ سبزیاں" },
                        { en: "Meats/Protein", ur: "گوشت اور پروٹین" },
                        { en: "Fats", ur: "چکنائی" },
                        { en: "Sweets/Desserts", ur: "میٹھا اور میٹھی چیزیں" }
                    ].map(group => (
                        <div key={group.en} className="flex flex-col p-4 bg-white border-2 border-primary-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                            <span className="text-[10px] font-black text-primary-400 uppercase mb-1">{group.en}</span>
                            <div className="flex items-center justify-between">
                                <span className={`font-bold text-primary-900 ${currentLanguage === 'ur' ? 'font-urdu text-lg' : ''}`}>
                                    {currentLanguage === 'ur' ? group.ur : group.en}:
                                </span>
                                <span className="px-3 py-1 bg-beige-50 border border-primary-900/20 text-primary-400 font-mono italic text-sm">
                                    ___ servings
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
