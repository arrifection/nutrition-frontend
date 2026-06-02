import { useState, useEffect, useMemo } from "react";
import { getExchangeList } from "../../../services/api";
import { Globe, Coffee, Cookie, UtensilsCrossed, Moon, Search } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_TYPES = [
    { key: "breakfast", label: "Breakfast", icon: Coffee },
    { key: "snack", label: "Snack", icon: Cookie },
    { key: "lunch", label: "Lunch", icon: UtensilsCrossed },
    { key: "dinner", label: "Dinner", icon: Moon },
];

const GROUP_COLORS = {
    Starches: "#f59e0b",
    Fruits: "#ec4899",
    Milk: "#60a5fa",
    Vegetables: "#22c55e",
    Meat: "#ef4444",
    Fats: "#a78bfa",
    Sweets: "#f97316",
    Other: "#94a3b8",
};

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

        const groupOrder = ["Starches", "Fruits", "Milk", "Vegetables", "Meat", "Fats", "Sweets"];
        const groups = {};
        groupOrder.forEach((g) => (groups[g] = []));

        filtered.forEach((item) => {
            const g = item.group?.en || "Other";
            if (!groups[g]) groups[g] = [];
            groups[g].push(item);
        });

        Object.keys(groups).forEach((key) => {
            if (groups[key].length === 0) delete groups[key];
        });

        return groups;
    }, [allFoods, searchTerm]);

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

    const getMealTotals = (mealKey) => {
        const list = meals[mealKey] || [];
        return list.reduce(
            (acc, food) => ({
                carbs: acc.carbs + ((food.macros?.carbs_g ?? food.carbohydrates) || 0),
                protein: acc.protein + ((food.macros?.protein_g ?? food.protein) || 0),
                fat: acc.fat + ((food.macros?.fat_g ?? food.fat) || 0),
                calories: acc.calories + ((food.macros?.calories ?? food.calories) || 0),
            }),
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

    const caloriePct = Math.min(100, (totalConsumed.calories / targets.calories) * 100);
    const overCalories = totalConsumed.calories > targets.calories;
    const selectedMealLabel = MEAL_TYPES.find((m) => m.key === selectedMeal)?.label || "Meal";

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

    const getRemainingClass = (value) => {
        if (value < 0) return "is-over";
        if (value < 20) return "is-low";
        return "is-ok";
    };

    return (
        <div className="section dd-plan-step dd-step4">
            <div className="dd-step-header">
                <h2 className="section-title">Daily Meal Planner</h2>
                <p className="text-sm text-gray-500">
                    Step 4 of 5 — Add foods for {currentDay}
                </p>
            </div>

            <div className="dd-form-group dd-step4-days">
                <p className="dd-form-group-label">Select day</p>
                <div className="dd-day-tabs dd-step4-day-tabs">
                    {DAYS.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => setCurrentDay(day)}
                            className={`dd-step4-day-pill ${currentDay === day ? "is-active" : ""}`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dd-meal-planner-grid">
                <div className="lg:col-span-1 order-1 lg:order-3 meal-planner-summary">
                    <div className="dd-step4-summary">
                        <p className="dd-step4-summary-label">Daily progress</p>
                        <div className="dd-step4-cal-block">
                            <div className="dd-step4-cal-row">
                                <span className="dd-step4-cal-value">{Math.round(totalConsumed.calories)}</span>
                                <span className="dd-step4-cal-target">/ {targets.calories} kcal</span>
                            </div>
                            <div className="dd-step4-cal-bar">
                                <div
                                    className={`dd-step4-cal-fill ${overCalories ? "is-over" : ""}`}
                                    style={{ width: `${caloriePct}%` }}
                                />
                            </div>
                        </div>
                        <p className="dd-step4-summary-sub">Remaining macros</p>
                        <div className="dd-step4-remain-grid">
                            <div className={`dd-step4-remain-chip dd-step4-remain-chip--carbs ${getRemainingClass(remaining.carbs)}`}>
                                <span>Carbs</span>
                                <strong>{Math.round(remaining.carbs)}g</strong>
                            </div>
                            <div className={`dd-step4-remain-chip dd-step4-remain-chip--protein ${getRemainingClass(remaining.protein)}`}>
                                <span>Protein</span>
                                <strong>{Math.round(remaining.protein)}g</strong>
                            </div>
                            <div className={`dd-step4-remain-chip dd-step4-remain-chip--fat ${getRemainingClass(remaining.fat)}`}>
                                <span>Fat</span>
                                <strong>{Math.round(remaining.fat)}g</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 order-2 lg:order-2">
                    <div className="dd-form-group dd-step4-meals-panel">
                        <p className="dd-form-group-label">Meals — tap to add foods</p>
                        <div className="dd-meals-grid">
                            {MEAL_TYPES.map((meal) => {
                                const Icon = meal.icon;
                                const list = meals[meal.key] || [];
                                const totals = getMealTotals(meal.key);
                                const isSelected = selectedMeal === meal.key;

                                return (
                                    <div
                                        key={meal.key}
                                        className={`meal-section meal-section--${meal.key} ${isSelected ? "meal-section-selected" : ""}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedMeal(meal.key)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setSelectedMeal(meal.key);
                                            }
                                        }}
                                    >
                                        <div className="meal-header">
                                            <span className="meal-title">
                                                <Icon size={15} className="meal-icon" aria-hidden="true" />
                                                {meal.label}
                                            </span>
                                            <span className={`meal-count ${isSelected ? "is-active" : ""}`}>
                                                {isSelected ? "Adding here" : `${list.length} items`}
                                            </span>
                                        </div>
                                        {list.length > 0 ? (
                                            <div className="dd-step4-meal-items">
                                                {list.map((food) => (
                                                    <div key={food.instanceId} className="dd-step4-food-row">
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`dd-step4-food-name ${lang === "ur" ? "font-urdu" : ""}`}>
                                                                {getFoodDisplayName(food)}
                                                            </p>
                                                            <p className="dd-step4-food-kcal">{food.macros?.calories || food.calories} kcal</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                removeFood(meal.key, food.instanceId);
                                                            }}
                                                            className="dd-step4-remove-btn"
                                                            aria-label="Remove food"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="dd-step4-meal-macros">
                                                    <span className="macro-c">C {Math.round(totals.carbs)}g</span>
                                                    <span className="macro-p">P {Math.round(totals.protein)}g</span>
                                                    <span className="macro-f">F {Math.round(totals.fat)}g</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="dd-step4-meal-empty">Tap to add foods</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 order-3 lg:order-1">
                    <div className="dd-form-group dd-step4-picker">
                        <div className="dd-step4-picker-head">
                            <p className="dd-form-group-label">Food database</p>
                            <span className="dd-step4-target-pill">→ {selectedMealLabel}</span>
                        </div>

                        <label className="form-label" htmlFor="step4-meal-select">Adding to</label>
                        <select
                            id="step4-meal-select"
                            value={selectedMeal}
                            onChange={(e) => setSelectedMeal(e.target.value)}
                            className="form-select dd-step4-meal-select"
                        >
                            {MEAL_TYPES.map((m) => (
                                <option key={m.key} value={m.key}>{m.label}</option>
                            ))}
                        </select>

                        <div className="dd-step4-search-row">
                            <div className="dd-step4-search-wrap">
                                <Search size={16} className="dd-step4-search-icon" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder={lang === "ur" ? "مثلاً چاول، سیب..." : "Search rice, apple..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input dd-step4-search-input"
                                    dir={lang === "ur" ? "rtl" : "ltr"}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setLang((prev) => (prev === "en" ? "ur" : "en"))}
                                className="dd-step4-lang-btn"
                                title="Switch language"
                            >
                                <Globe size={14} />
                                {lang === "en" ? "اردو" : "EN"}
                            </button>
                        </div>

                        <div className="dd-food-picker dd-step4-food-list">
                            {loading ? (
                                <div className="dd-step4-loading">Loading foods...</div>
                            ) : Object.keys(groupedFoods).length === 0 ? (
                                <div className="dd-step4-loading">No foods found</div>
                            ) : (
                                Object.keys(groupedFoods).map((group) => (
                                    <div key={group} className="dd-step4-food-group">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                                            className="dd-step4-group-btn"
                                        >
                                            <span className="dd-step4-group-left">
                                                <span
                                                    className="dd-step4-group-dot"
                                                    style={{ background: GROUP_COLORS[group] || GROUP_COLORS.Other }}
                                                />
                                                <span className={lang === "ur" ? "font-urdu" : ""}>{getGroupDisplayName(group)}</span>
                                            </span>
                                            <span className="dd-step4-group-meta">
                                                {groupedFoods[group].length} · {expandedGroup === group ? "−" : "+"}
                                            </span>
                                        </button>

                                        {expandedGroup === group && (
                                            <div className="dd-step4-group-items">
                                                {groupedFoods[group].map((food, idx) => (
                                                    <div key={idx} className="dd-step4-picker-row">
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`dd-step4-picker-name ${lang === "ur" ? "font-urdu" : ""}`}>
                                                                {getFoodDisplayName(food)}
                                                            </p>
                                                            <p className="dd-step4-picker-meta">
                                                                {food.serving_size || food.portion} · {food.macros?.calories || food.calories} kcal
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => addFood(food)}
                                                            className="dd-step4-add-btn"
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
            </div>

            <div className="step-actions flex justify-between pt-8 border-t border-emerald-100 mt-2">
                <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
                <button type="button" onClick={onProceed} className="btn-primary">Review Weekly Plan →</button>
            </div>
        </div>
    );
}
