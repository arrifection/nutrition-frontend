export const SUPPORTED_ALLERGENS = [
    { key: "milk", label: "Milk" },
    { key: "egg", label: "Egg" },
    { key: "wheat", label: "Wheat" },
    { key: "soy", label: "Soy" },
    { key: "peanut", label: "Peanut" },
    { key: "tree_nut", label: "Tree Nut" },
    { key: "fish", label: "Fish" },
    { key: "shellfish", label: "Shellfish" },
    { key: "sesame", label: "Sesame" },
];

/** @deprecated Use parsePatientAllergies — kept for backward compatibility */
export const STANDARD_ALLERGENS = SUPPORTED_ALLERGENS;

export const ALLERGEN_LABELS = Object.fromEntries(
    SUPPORTED_ALLERGENS.map((a) => [a.key, a.label])
);

const ALLERGEN_ALIASES = {
    milk: "milk",
    dairy: "milk",
    lactose: "milk",
    egg: "egg",
    eggs: "egg",
    wheat: "wheat",
    gluten: "wheat",
    soy: "soy",
    soya: "soy",
    peanut: "peanut",
    peanuts: "peanut",
    "tree nut": "tree_nut",
    "tree nuts": "tree_nut",
    treenut: "tree_nut",
    tree_nut: "tree_nut",
    tree_nuts: "tree_nut",
    almond: "tree_nut",
    almonds: "tree_nut",
    walnut: "tree_nut",
    walnuts: "tree_nut",
    cashew: "tree_nut",
    fish: "fish",
    shellfish: "shellfish",
    shrimp: "shellfish",
    prawn: "shellfish",
    sesame: "sesame",
    tahini: "sesame",
};

export function parsePatientAllergies(allergiesText) {
    if (!allergiesText || typeof allergiesText !== "string") return [];

    const tokens = allergiesText
        .split(/[,;\n]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

    const normalized = new Set();
    tokens.forEach((token) => {
        const key = token.replace(/\s+/g, " ");
        if (ALLERGEN_ALIASES[key]) {
            normalized.add(ALLERGEN_ALIASES[key]);
            return;
        }
        const underscored = key.replace(/\s+/g, "_");
        if (ALLERGEN_ALIASES[underscored]) {
            normalized.add(ALLERGEN_ALIASES[underscored]);
            return;
        }
        if (ALLERGEN_LABELS[underscored]) {
            normalized.add(underscored);
        } else {
            normalized.add(key);
        }
    });

    return [...normalized];
}
