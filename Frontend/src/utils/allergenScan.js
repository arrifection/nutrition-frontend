import { ALLERGEN_LABELS, parsePatientAllergies, SUPPORTED_ALLERGENS } from "../constants/allergens";

const ALLERGEN_KEYWORDS = {
    milk: ["milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "dairy", "whey", "paneer", "ghee", "curd", "lassi"],
    egg: ["egg", "omelet", "omelette", "mayonnaise", "mayo"],
    wheat: ["wheat", "bread", "flour", "pasta", "noodle", "roti", "naan", "cereal", "gluten", "semolina", "atta", "paratha", "cracker", "biscuit", "bagel", "muffin", "waffle", "tortilla", "chapatti", "pita"],
    soy: ["soy", "soya", "tofu", "tempeh", "edamame", "miso", "soybean"],
    peanut: ["peanut", "groundnut", "satay"],
    tree_nut: ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia", "brazil nut", "pine nut"],
    fish: ["fish", "salmon", "tuna", "cod", "sardine", "mackerel", "trout", "anchovy", "tilapia", "rohu", "hilsa"],
    shellfish: ["shrimp", "prawn", "crab", "lobster", "shellfish", "oyster", "clam", "mussel", "squid", "calamari"],
    sesame: ["sesame", "tahini"],
};

function foodSearchText(food) {
    const parts = [];
    if (typeof food.name === "string") parts.push(food.name);
    if (typeof food.notes === "string") parts.push(food.notes);

    const foodName = food.food_name || {};
    Object.values(foodName).forEach((v) => {
        if (typeof v === "string") parts.push(v);
    });

    [food.group, food.subcategory].forEach((block) => {
        if (block && typeof block === "object") {
            Object.values(block).forEach((v) => {
                if (typeof v === "string") parts.push(v);
            });
        }
    });

    return parts.join(" ").toLowerCase();
}

function cleanAllergenFalsePositives(allergens, text) {
    const cleaned = new Set(allergens);
    if (text.includes("peanut butter")) {
        cleaned.delete("milk");
        cleaned.delete("tree_nut");
    }
    if (text.includes("coconut milk") && !text.replace(/coconut milk/g, "").includes("milk")) {
        cleaned.delete("milk");
    }
    return [...cleaned];
}

export function detectFoodAllergensFromText(food) {
    const text = foodSearchText(food);
    if (!text.trim()) return [];

    const detected = Object.entries(ALLERGEN_KEYWORDS)
        .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
        .map(([allergen]) => allergen);
    return cleanAllergenFalsePositives(detected, text);
}

export function getFoodAllergens(food) {
    const tagged = food?.allergens;
    if (Array.isArray(tagged) && tagged.length > 0) {
        return [...new Set(tagged.map((a) => String(a).toLowerCase()))];
    }
    return detectFoodAllergensFromText(food);
}

export function getActivePatientAllergens(patientOrAllergies) {
    if (!patientOrAllergies) return [];

    if (typeof patientOrAllergies === "string") {
        return parsePatientAllergies(patientOrAllergies);
    }

    if (patientOrAllergies.allergies) {
        return parsePatientAllergies(patientOrAllergies.allergies);
    }

    // Backward compatibility: structured checkbox profile
    const structured = patientOrAllergies.allergens;
    if (structured && typeof structured === "object") {
        const active = SUPPORTED_ALLERGENS
            .filter(({ key }) => structured[key])
            .map(({ key }) => key);
        (structured.custom || []).forEach((item) => {
            if (typeof item === "string" && item.trim()) {
                active.push(item.trim().toLowerCase());
            }
        });
        return active;
    }

    return [];
}

export function getFoodAllergenConflicts(patientData, food) {
    const active = getActivePatientAllergens(patientData);
    if (!active.length) return [];

    const foodAllergens = getFoodAllergens(food);
    const foodName = food?.food_name?.en || food?.name || "Unknown food";

    return foodAllergens
        .filter((allergen) => active.includes(allergen))
        .map((allergen) => ({
            food_name: foodName,
            allergen,
            allergen_label: ALLERGEN_LABELS[allergen] || allergen.replace(/_/g, " "),
            message: `${foodName} contains ${ALLERGEN_LABELS[allergen] || allergen}`,
        }));
}

export function scanMealPlanAllergenConflicts(patientData, weekPlan) {
    const active = getActivePatientAllergens(patientData);
    if (!active.length) return [];

    const activeSet = new Set(active);
    const customAllergens = active.filter((a) => !ALLERGEN_LABELS[a]);
    const conflicts = [];
    const seen = new Set();

    Object.entries(weekPlan || {}).forEach(([day, meals]) => {
        if (!meals || typeof meals !== "object") return;

        Object.entries(meals).forEach(([mealType, items]) => {
            if (!Array.isArray(items)) return;

            items.forEach((food) => {
                const foodName = food?.food_name?.en || food?.name || "Unknown food";
                const text = foodSearchText(food);
                const detected = new Set(getFoodAllergens(food));

                customAllergens.forEach((custom) => {
                    if (text.includes(custom)) detected.add(custom);
                });

                [...detected].filter((a) => activeSet.has(a)).forEach((allergen) => {
                    const key = `${day}|${mealType}|${food?.id || foodName}|${allergen}`;
                    if (seen.has(key)) return;
                    seen.add(key);

                    conflicts.push({
                        day,
                        meal: mealType,
                        food_name: foodName,
                        allergen,
                        allergen_label: ALLERGEN_LABELS[allergen] || allergen.replace(/_/g, " "),
                        patient_allergy: ALLERGEN_LABELS[allergen] || allergen,
                        message: `${foodName} may contain ${ALLERGEN_LABELS[allergen] || allergen}`,
                    });
                });
            });
        });
    });

    return conflicts;
}
