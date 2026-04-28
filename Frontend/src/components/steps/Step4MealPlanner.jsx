import { useState, useEffect, useMemo } from "react";
import { getExchangeList } from "../../services/api";
import { Globe } from "lucide-react";

export default function Step4MealPlanner({
    macroTargets,
    weekPlan,
    setWeekPlan,
    currentDay,
    setCurrentDay,
    onError,
    onProceed,
    onBack,
}) {
    const [allFoods, setAllFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [lang, setLang] = useState("en");

    // Default targets
    const targets = macroTargets || {
        carbs: 200,
        protein: 150,
        fat: 65,
        calories: 2000,
    };

    const meals = weekPlan[currentDay] || {
        breakfast: [],
        snack: [],
        lunch: [],
        dinner: [],
    };

    const mealTypes = [
        { key: "breakfast", label: "Breakfast" },
        { key: "snack", label: "Snack" },
        { key: "lunch", label: "Lunch" },
        { key: "dinner", label: "Dinner" },
    ];

    // Load exchange list
    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            const response = await getExchangeList(null);
            if (response.success) {
                setAllFoods(response.data.items || []);
            } else {
                onError?.(response.error);
            }
            setLoading(false);
        };
        fetchFoods();
    }, []);

    // Group foods by category
    const groupedFoods = useMemo(() => {
        if (!allFoods || allFoods.length === 0) return {};

        const search = searchTerm.toLowerCase();
        const filtered = allFoods.filter(
            (f) =>
                (f.food_name?.en || "").toLowerCase().includes(search) ||
                (f.food_name?.ur_patient || "").includes(searchTerm) ||
                (f.food_name?.ur_clinical || "").includes(searchTerm) ||
                (f.group?.en || "").toLowerCase().includes(search)
        );

        const groupOrder = [
            "Starches",
            "Fruits",
            "Milk",
            "Vegetables",
            "Meat",
            "Fats",
            "Sweets",
        ];
        const groups = {};
        groupOrder.forEach((g) => (groups[g] = []));

        filtered.forEach((item) => {
            const g = item.group?.en || "Other";
            if (!groups[g]) groups[g] = [];
            groups[g].push(item);
        });

        // Remove empty groups
        Object.keys(groups).forEach((key) => {
            if (groups[key].length === 0) delete groups[key];
        });

        return groups;
    }, [allFoods, searchTerm]);

    // Helper to get display name based on language
    const getFoodDisplayName = (food) => {
        if (lang === "ur") {
            return food.food_name?.ur_patient || food.food_name?.ur_clinical || food.food_name?.en || food.name || "Unknown";
        }
        return food.food_name?.en || food.name || "Unknown";
    };

    const getGroupDisplayName = (groupKey) => {
        if (lang === "ur") {
            const items = groupedFoods[groupKey];
            if (items && items.length > 0) {
                return items[0].group?.ur || groupKey;
            }
        }
        return groupKey;
    };

    // Calculations
    const getMealTotals = (mealKey) => {
        const list = meals[mealKey] || [];
        return list.reduce(
            (acc, food) => {
                const carbs = (food.macros?.carbs_g ?? food.carbohydrates) || 0;
                const protein = (food.macros?.protein_g ?? food.protein) || 0;
                const fat = (food.macros?.fat_g ?? food.fat) || 0;
                const calories = (food.macros?.calories ?? food.calories) || 0;
                
                return {
                    carbs: acc.carbs + carbs,
                    protein: acc.protein + protein,
                    fat: acc.fat + fat,
                    calories: acc.calories + calories,
                };
            },
            { carbs: 0, protein: 0, fat: 0, calories: 0 }
        );
    };

    const totalConsumed = useMemo(() => {
        return Object.keys(meals).reduce(
            (acc, mealKey) => {
                const mealTotals = getMealTotals(mealKey);
                return {
                    carbs: acc.carbs + mealTotals.carbs,
                    protein: acc.protein + mealTotals.protein,
                    fat: acc.fat + mealTotals.fat,
                    calories: acc.calories + mealTotals.calories,
                };
            },
            { carbs: 0, protein: 0, fat: 0, calories: 0 }
        );
    }, [meals]);

    const remaining = useMemo(
        () => ({
            carbs: targets.carbs - totalConsumed.carbs,
            protein: targets.protein - totalConsumed.protein,
            fat: targets.fat - totalConsumed.fat,
            calories: targets.calories - totalConsumed.calories,
        }),
        [targets, totalConsumed]
    );

    // Actions
    const addFood = (food) => {
        setWeekPlan((prev) => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [selectedMeal]: [
                    ...(prev[currentDay][selectedMeal] || []),
                    { ...food, instanceId: Date.now() },
                ],
            },
        }));
    };

    const removeFood = (mealKey, foodId) => {
        setWeekPlan((prev) => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [mealKey]: prev[currentDay][mealKey].filter((f) => f.instanceId !== foodId),
            },
        }));
    };

    const getRemainingColor = (value) => {
        if (value < 0) return "text-red-600";
        if (value < 20) return "text-amber-600";
        return "text-gray-800";
    };

    return (
        <div className="section">
            <div className="mb-6">
                <h2 className="section-title">Daily Meal Planner</h2>
                <p className="text-sm text-gray-500">
                    Step 4 of 5 — Add foods to meals for {currentDay}
                </p>
            </div>

            <div className="flex gap-1 mb-6 pb-4 border-b border-gray-100 overflow-x-auto">
                {[
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
                ].map((day) => (
                    <button
                        key={day}
                        onClick={() => setCurrentDay(day)}
                        className={`px-3 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${currentDay === day
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {day.slice(0, 3)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="border border-gray-200 rounded-sm">
                        <div className="p-4 border-b border-gray-100">
                            <label className="form-label">Adding to:</label>
                            <select
                                value={selectedMeal}
                                onChange={(e) => setSelectedMeal(e.target.value)}
                                className="form-select"
                            >
                                {mealTypes.map((m) => (
                                    <option key={m.key} value={m.key}>{m.label}</option>
                                ))}
                            </select>

                            <div className="flex items-center justify-between mt-4">
                                <label className="form-label">{lang === "ur" ? "تلاش کریں:" : "Search foods:"}</label>
                                <button
                                    onClick={() => setLang(prev => prev === "en" ? "ur" : "en")}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors border border-gray-200"
                                    title="Switch Language"
                                >
                                    <Globe size={13} />
                                    {lang === "en" ? "اردو" : "EN"}
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder={lang === "ur" ? "مثلاً چاول، سیب..." : "e.g. Rice, Apple..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                dir={lang === "ur" ? "rtl" : "ltr"}
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading foods...</div>
                            ) : (
                                Object.keys(groupedFoods).map((group) => (
                                    <div key={group} className="border-b border-gray-100 last:border-0">
                                        <button
                                            onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
                                        >
                                            <span className={`text-sm font-medium text-gray-700 ${lang === "ur" ? "font-urdu" : ""}`}>{getGroupDisplayName(group)}</span>
                                            <span className="text-xs text-gray-400">
                                                {groupedFoods[group].length} {lang === "ur" ? "آئٹمز" : "items"} {expandedGroup === group ? "−" : "+"}
                                            </span>
                                        </button>

                                        {expandedGroup === group && (
                                            <div className="bg-gray-50 border-t border-gray-100">
                                                {groupedFoods[group].map((food, idx) => (
                                                    <div key={idx} className="px-4 py-2 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-white">
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm text-gray-800 truncate ${lang === "ur" ? "font-urdu" : ""}`}>{getFoodDisplayName(food)}</p>
                                                            <p className="text-xs text-gray-400">{food.serving_size || food.portion} • {food.macros?.calories || food.calories} kcal</p>
                                                        </div>
                                                        <button
                                                            onClick={() => addFood(food)}
                                                            className="ml-2 px-2 py-1 text-xs font-medium bg-gray-800 text-white rounded-sm hover:bg-gray-700"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 order-1 lg:order-2">
                    <div className="space-y-4">
                        {mealTypes.map((meal) => {
                            const list = meals[meal.key] || [];
                            const totals = getMealTotals(meal.key);
                            return (
                                <div key={meal.key} className="meal-section">
                                    <div className="meal-header">
                                        <span className="meal-title">{meal.label}</span>
                                        <span className="meal-count">{list.length} items</span>
                                    </div>
                                    {list.length > 0 ? (
                                        <div className="space-y-2">
                                            {list.map((food) => (
                                                <div key={food.instanceId} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm text-gray-800 truncate ${lang === "ur" ? "font-urdu" : ""}`}>{getFoodDisplayName(food)}</p>
                                                        <p className="text-xs text-gray-400">{food.macros?.calories || food.calories} kcal</p>
                                                    </div>
                                                    <button onClick={() => removeFood(meal.key, food.instanceId)} className="ml-2 text-gray-400 hover:text-red-500 text-sm">×</button>
                                                </div>
                                            ))}
                                            <div className="pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500 flex gap-3">
                                                <span>C: {Math.round(totals.carbs)}g</span>
                                                <span>P: {Math.round(totals.protein)}g</span>
                                                <span>F: {Math.round(totals.fat)}g</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-300 text-center py-4">No foods added</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1 order-3">
                    <div className="remaining-box sticky top-4">
                        <div className="remaining-title">Daily Summary</div>
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Calories</div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-semibold text-gray-800">{Math.round(totalConsumed.calories)}</span>
                                <span className="text-sm text-gray-500">/ {targets.calories} kcal</span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full transition-all ${totalConsumed.calories > targets.calories ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (totalConsumed.calories / targets.calories) * 100)}%` }} />
                            </div>
                        </div>
                        <div className="remaining-title">Remaining</div>
                        <div className="space-y-3">
                            <div className="remaining-item">
                                <span className="remaining-label">Carbs</span>
                                <span className={`remaining-value ${getRemainingColor(remaining.carbs)}`}>{Math.round(remaining.carbs)}g</span>
                            </div>
                            <div className="remaining-item">
                                <span className="remaining-label">Protein</span>
                                <span className={`remaining-value ${getRemainingColor(remaining.protein)}`}>{Math.round(remaining.protein)}g</span>
                            </div>
                            <div className="remaining-item">
                                <span className="remaining-label">Fat</span>
                                <span className={`remaining-value ${getRemainingColor(remaining.fat)}`}>{Math.round(remaining.fat)}g</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button onClick={onBack} className="btn-secondary">← Back</button>
                <button onClick={onProceed} className="btn-primary">Review Weekly Plan →</button>
            </div>
        </div>
    );
}
