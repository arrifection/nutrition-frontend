"""Allergen detection from food tags, names, groups, and patient allergy text."""



import re

from typing import Any



STANDARD_ALLERGENS = [

    "milk",

    "egg",

    "wheat",

    "soy",

    "peanut",

    "tree_nut",

    "fish",

    "shellfish",

    "sesame",

]



ALLERGEN_LABELS = {

    "peanut": "Peanut",

    "tree_nut": "Tree Nut",

    "milk": "Milk",

    "egg": "Egg",

    "soy": "Soy",

    "wheat": "Wheat",

    "fish": "Fish",

    "shellfish": "Shellfish",

    "sesame": "Sesame",

}



ALLERGEN_ALIASES: dict[str, str] = {

    "milk": "milk",

    "dairy": "milk",

    "lactose": "milk",

    "egg": "egg",

    "eggs": "egg",

    "wheat": "wheat",

    "gluten": "wheat",

    "soy": "soy",

    "soya": "soy",

    "peanut": "peanut",

    "peanuts": "peanut",

    "tree nut": "tree_nut",

    "tree nuts": "tree_nut",

    "treenut": "tree_nut",

    "tree_nut": "tree_nut",

    "tree_nuts": "tree_nut",

    "almond": "tree_nut",

    "almonds": "tree_nut",

    "walnut": "tree_nut",

    "walnuts": "tree_nut",

    "cashew": "tree_nut",

    "fish": "fish",

    "shellfish": "shellfish",

    "shrimp": "shellfish",

    "prawn": "shellfish",

    "sesame": "sesame",

    "tahini": "sesame",

}



ALLERGEN_KEYWORDS: dict[str, list[str]] = {

    "peanut": ["peanut", "groundnut", "peanut butter", "satay", "mungfali"],

    "tree_nut": [

        "almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut",

        "macadamia", "tree nut", "brazil nut", "pine nut", "chestnut",

        "nut butter", "nut spread", "mixed nuts",

    ],

    "milk": [

        "milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "dairy",

        "whey", "lactose", "paneer", "ghee", "curd", "lassi",

    ],

    "egg": ["egg", "omelet", "omelette", "mayonnaise", "mayo", "albumen"],

    "soy": ["soy", "soya", "tofu", "tempeh", "edamame", "miso", "soybean"],

    "wheat": [

        "wheat", "bread", "flour", "pasta", "noodle", "roti", "naan", "cereal",

        "gluten", "semolina", "atta", "paratha", "cracker", "biscuit",

    ],

    "fish": [

        "fish", "salmon", "tuna", "cod", "sardine", "mackerel", "trout",

        "anchovy", "herring", "tilapia", "rohu", "hilsa",

    ],

    "shellfish": [

        "shrimp", "prawn", "crab", "lobster", "shellfish", "oyster", "clam",

        "mussel", "squid", "calamari", "scallop", "crayfish",

    ],

    "sesame": ["sesame", "tahini"],

}





def _food_search_text(food: dict[str, Any]) -> str:

    parts: list[str] = []

    for key in ("name", "notes"):

        val = food.get(key)

        if isinstance(val, str):

            parts.append(val)



    food_name = food.get("food_name") or {}

    if isinstance(food_name, dict):

        for val in food_name.values():

            if isinstance(val, str):

                parts.append(val)



    group = food.get("group") or {}

    if isinstance(group, dict):

        for val in group.values():

            if isinstance(val, str):

                parts.append(val)



    subcategory = food.get("subcategory") or {}

    if isinstance(subcategory, dict):

        for val in subcategory.values():

            if isinstance(val, str):

                parts.append(val)



    return " ".join(parts).lower()





def _clean_allergen_false_positives(allergens: set[str], text: str) -> set[str]:

    cleaned = set(allergens)

    if "peanut butter" in text:

        cleaned.discard("milk")

        cleaned.discard("tree_nut")

    if "coconut milk" in text and "milk" not in text.replace("coconut milk", ""):

        cleaned.discard("milk")

    return cleaned





def _detect_food_allergens_from_text(food: dict[str, Any]) -> list[str]:

    text = _food_search_text(food)

    if not text.strip():

        return []



    detected: set[str] = set()

    for allergen, keywords in ALLERGEN_KEYWORDS.items():

        if any(keyword in text for keyword in keywords):

            detected.add(allergen)

    return sorted(_clean_allergen_false_positives(detected, text))





def detect_food_allergens(food: dict[str, Any]) -> list[str]:

    """Return allergens from explicit food tags first, then keyword fallback."""

    tagged = food.get("allergens")

    if isinstance(tagged, list) and tagged:

        return sorted({str(a).lower() for a in tagged if a})



    return _detect_food_allergens_from_text(food)





def parse_patient_allergies_text(allergies_text: str | None) -> list[str]:

    if not allergies_text or not isinstance(allergies_text, str):

        return []



    tokens = re.split(r"[,;\n]+", allergies_text)

    normalized: set[str] = set()



    for raw in tokens:

        token = raw.strip().lower()

        if not token:

            continue

        key = re.sub(r"\s+", " ", token)

        if key in ALLERGEN_ALIASES:

            normalized.add(ALLERGEN_ALIASES[key])

            continue

        underscored = key.replace(" ", "_")

        if underscored in ALLERGEN_ALIASES:

            normalized.add(ALLERGEN_ALIASES[underscored])

            continue

        if underscored in ALLERGEN_LABELS:

            normalized.add(underscored)

        else:

            normalized.add(key)



    return sorted(normalized)





def get_active_patient_allergens(

    patient_allergens: dict[str, Any] | None = None,

    allergies_text: str | None = None,

) -> list[str]:

    if allergies_text:

        parsed = parse_patient_allergies_text(allergies_text)

        if parsed:

            return parsed



    if not patient_allergens:

        return []



    active: list[str] = []

    for key in STANDARD_ALLERGENS:

        if patient_allergens.get(key):

            active.append(key)



    custom = patient_allergens.get("custom") or []

    if isinstance(custom, list):

        for item in custom:

            if isinstance(item, str) and item.strip():

                active.append(item.strip().lower())



    return active





def resolve_patient_allergens(patient: dict[str, Any] | None) -> list[str]:

    """Resolve active allergens from patient profile (text field preferred)."""

    if not patient:

        return []



    if patient.get("allergies"):

        parsed = parse_patient_allergies_text(patient.get("allergies"))

        if parsed:

            return parsed



    return get_active_patient_allergens(patient.get("allergens"))





def scan_meal_plan_conflicts(

    patient_allergens: dict[str, Any] | None = None,

    week_plan: dict[str, Any] | None = None,

    allergies_text: str | None = None,

    patient: dict[str, Any] | None = None,

) -> list[dict[str, Any]]:

    if patient:

        active = resolve_patient_allergens(patient)

    else:

        active = get_active_patient_allergens(patient_allergens, allergies_text)



    if not active:

        return []



    active_set = set(active)

    custom_allergens = [a for a in active if a not in STANDARD_ALLERGENS]



    conflicts: list[dict[str, Any]] = []

    seen: set[str] = set()



    for day, meals in (week_plan or {}).items():

        if not isinstance(meals, dict):

            continue

        for meal_type, items in meals.items():

            if not isinstance(items, list):

                continue

            for food in items:

                if not isinstance(food, dict):

                    continue



                food_name = (

                    food.get("food_name", {}).get("en")

                    or food.get("name")

                    or "Unknown food"

                )

                detected = set(detect_food_allergens(food))



                for custom in custom_allergens:

                    if custom in _food_search_text(food):

                        detected.add(custom)



                matched = detected.intersection(active_set)

                for allergen in sorted(matched):

                    key = f"{day}|{meal_type}|{food.get('id', food_name)}|{allergen}"

                    if key in seen:

                        continue

                    seen.add(key)

                    label = ALLERGEN_LABELS.get(allergen, allergen.replace("_", " ").title())

                    conflicts.append({

                        "day": day,

                        "meal": meal_type,

                        "food_name": food_name,

                        "allergen": allergen,

                        "allergen_label": label,

                        "message": f"{food_name} may contain {label}",

                    })



    return conflicts


