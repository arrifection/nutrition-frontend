# Static initial data for seeding MongoDB
# Complete Multilingual Food Exchange List – Clinical Reference Dataset
# ----------------------------------------------------------------------

EXCHANGE_LIST_INITIAL = []

def _item(id, name_en, portion, group_en, sub_en, category, carbs, pro, fat, cals, ur_clin=None, ur_pat=None, status="draft"):
    """Helper to build a multilingual food-exchange document."""
    return {
        "id": id,
        "group": {
            "en": group_en,
            "ur": None # Can be expanded if needed
        },
        "subcategory": {
            "en": sub_en,
            "ur": None # Can be expanded if needed
        },
        "food_name": {
            "en": name_en,
            "ur_clinical": ur_clin,
            "ur_patient": ur_pat
        },
        "serving_size": portion,
        "macros": {
            "carbs_g": carbs,
            "protein_g": pro,
            "fat_g": fat,
            "calories": cals
        },
        "translation_status": status,
        "is_active": True,
        "notes": ""
    }

# ============================================================
#  STARCHES
# ============================================================

# --- Breads and Flours ---
# IDs and Urdu names provided by user
_breads_data = [
    ("ST_BF_biscuit", "Biscuit", "1 (2 1/2 inches across)", "بسکٹ", "1 بسکٹ", "approved"),
    ("ST_BF_cornbread", "Cornbread", "1 (1 3/4 inch cube or 1 1/2 oz)", "کارن بریڈ", "1 ٹکڑا کارن بریڈ", "approved"),
    ("ST_BF_english_muffin", "English muffin", "1/2", "انگلش مفن", "آدھا مفن", "approved"),
    ("ST_BF_flour_mix", "Flour, corn meal, wheat germ", "3 Tbsp dry", "آٹا/کارن میل/ویٹ جرم", "3 چمچ آٹا یا کارن میل", "approved"),
    ("ST_BF_roll", "Roll, plain, small", "1 (1 oz)", "بریڈ رول", "1 چھوٹا رول", "approved"),
    ("ST_BF_stuffing", "Stuffing, bread", "1/3 cup", "بریڈ سٹفنگ", "آدھا کپ سٹفنگ", "approved"),
    ("ST_BF_taco_shell", "Taco shell or tostada shell", "2 crisp shells (5 inches across)", "ٹیکو شیل", "2 شیل", "approved"),
    ("ST_BF_tortilla_small", "Tortilla (Corn or flour, 6 inches across)", "1", "ٹورٹیلا (چھوٹا)", "1 ٹورٹیلا", "approved"),
    ("ST_BF_tortilla_large", "Tortilla (Flour, 10 inches across)", "1/3", "ٹورٹیلا (بڑا)", "آدھا بڑا ٹورٹیلا", "approved"),
    ("ST_BF_waffle", "Waffle", "1 (4-inch square, or 4 inches across)", "وافل", "1 وافل", "approved"),
    # Remaining items (generated IDs)
    ("ST_BF_bagel", "Bagel", "1/4 (1 oz)", None, None, "draft"),
    ("ST_BF_bread_reduced", "Bread (Reduced-calorie)", "2 slices (1 1/2 oz)", None, None, "draft"),
    ("ST_BF_bread_white", "Bread (White, whole-grain, pumpernickel, rye, raisin)", "1 slice (1 oz)", None, None, "draft"),
    ("ST_BF_bun", "Bun (hotdog or hamburger)", "1/2 bun (1 oz)", None, None, "draft"),
    ("ST_BF_chapatti", "Chapatti, small", "1 (6 inches across)", None, None, "draft"),
    ("ST_BF_naan", "Naan Indian Bread", "1/4 (8 inches by 2 inches)", None, None, "draft"),
    ("ST_BF_pancake", "Pancake, 1/4 inch thick", "1 (4 inches across)", None, None, "draft"),
    ("ST_BF_pita", "Pita bread", "1/2 pocket (6 inches across)", None, None, "draft"),
]

for id, n, p, ur_c, ur_p, stat in _breads_data:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Starches", "Breads and Flours", "carb", 15, 3, 1, 80, ur_c, ur_p, stat))

# --- Cereals, Grains and Pasta ---
_cereals_data = [
    ("ST_CG_barley", "Barley, cooked", "1/3 cup", "جو", "آدھا کپ جو", "approved"),
    ("ST_CG_oat_bran", "Oat bran", "1/4 cup", "اوٹ بران", "آدھا کپ", "approved"),
    ("ST_CG_wheat_bran", "Wheat bran", "1/2 cup", "گندم بران", "آدھا کپ", "approved"),
    ("ST_CG_bulgur", "Bulgur, cooked", "1/2 cup", "دلیا (بلغر)", "آدھا کپ دلیا", "approved"),
    ("ST_CG_cereal_bran", "Bran cereal", "1/2 cup", "بران سیریل", "آدھا کپ", "approved"),
    ("ST_CG_oats", "Oats, oatmeal, cooked", "1/2 cup", "اوٹس", "آدھا کپ اوٹس", "approved"),
    ("ST_CG_puffed", "Puffed cereal", "1 1/2 cups", "پفڈ سیریل", "1 کپ", "approved"),
    ("ST_CG_shredded_wheat", "Shredded wheat, plain", "1/2 cup", "شریڈڈ ویٹ", "آدھا کپ", "approved"),
    ("ST_CG_sugar_cereal", "Sugar-coated cereals", "1/2 cup", "میٹھا سیریل", "آدھا کپ", "approved"),
    ("ST_CG_unsweetened_cereal", "Unsweetened, ready-to-eat cereals", "3/4 cup", "بغیر چینی سیریل", "آدھا کپ", "approved"),
    ("ST_CG_couscous", "Couscous, cooked", "1/3 cup", "کسکس", "آدھا کپ", "approved"),
    ("ST_CG_granola", "Granola, regular or low-fat", "1/4 cup", "گرینولا", "آدھا کپ", "approved"),
    ("ST_CG_grits", "Grits, cooked", "1/2 cup", "گرٹس", "آدھا کپ", "approved"),
    ("ST_CG_kasha", "Kasha", "1/2 cup", "کاشا", "آدھا کپ", "approved"),
    ("ST_CG_millet", "Millet, cooked", "1/3 cup", "باجرہ", "آدھا کپ", "approved"),
    ("ST_CG_muesli", "Muesli", "1/4 cup", "میوسلی", "آدھا کپ", "approved"),
    ("ST_CG_polenta", "Polenta, cooked", "1/3 cup", "پولینٹا", "آدھا کپ", "approved"),
    ("ST_CG_quinoa", "Quinoa, cooked", "1/3 cup", "کوئنوا", "آدھا کپ", "approved"),
    ("ST_CG_tabbouleh", "Tabbouleh, prepared", "1/2 cup", "تبولہ سلاد", "آدھا کپ", "approved"),
    ("ST_CG_wheat_germ", "Wheat germ, dry", "3 Tbsp", "ویٹ جرم", "3 چمچ", "approved"),
    ("ST_CG_wild_rice", "Wild rice, cooked", "1/2 cup", "وائلڈ رائس", "آدھا کپ", "approved"),
    # Remaining items
    ("ST_CG_pasta", "Pasta, cooked", "1/3 cup", None, None, "draft"),
    ("ST_CG_rice_white", "Rice, white or brown, cooked", "1/3 cup", None, None, "draft"),
]

for id, n, p, ur_c, ur_p, stat in _cereals_data:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Starches", "Cereals, Grains and Pasta", "carb", 15, 3, 1, 80, ur_c, ur_p, stat))

# --- Starchy Vegetables ---
_starchy_veg = [
    ("ST_SV_cassava", "Cassava", "1/3 cup"),
    ("ST_SV_corn", "Corn", "1/2 cup"),
    ("ST_SV_corn_cob", "Corn on cob, large", "1/2 cob (5 oz)"),
    ("ST_SV_hominy", "Hominy, canned", "3/4 cup"),
    ("ST_SV_parsnips", "Parsnips", "1/2 cup"),
    ("ST_SV_peas_green", "Peas, green", "1/2 cup"),
    ("ST_SV_plantain", "Plantain, ripe", "1/3 cup"),
    ("ST_SV_potato_baked", "Potato (Baked with skin)", "1/4 large (3 oz)"),
    ("ST_SV_potato_boiled", "Potato (Boiled, all kinds)", "1/2 cup or 1/2 medium (3 oz)"),
    ("ST_SV_potato_mashed", "Potato (Mashed, with milk)", "1/2 cup"),
    ("ST_SV_potato_french", "Potato (French fried, oven baked)", "1 cup (2 oz)"),
    ("ST_SV_pumpkin", "Pumpkin, canned, no sugar added", "1 cup"),
    ("ST_SV_squash_winter", "Squash, winter", "1 cup"),
    ("ST_SV_succotash", "Succotash", "1/2 cup"),
    ("ST_SV_yam", "Yam, sweet potato", "1/2 cup"),
]
for id, n, p in _starchy_veg:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Starches", "Starchy Vegetables", "carb", 15, 3, 1, 80))

# --- Snacks ---
_snacks = [
    ("ST_SN_animal", "Animal crackers", "8 crackers"),
    ("ST_SN_crispbread", "Crispbreads", "2-5 (3/4 oz)"),
    ("ST_SN_butter_crackers", "Round-butter type crackers", "6"),
    ("ST_SN_saltine", "Saltine-type crackers", "6"),
    ("ST_SN_sandwich", "Sandwich-style crackers, with filling", "3"),
    ("ST_SN_whole_wheat", "Whole-wheat regular crackers", "2-5 (3/4 oz)"),
    ("ST_SN_graham", "Graham crackers", "3 squares"),
    ("ST_SN_matzoh", "Matzoh", "3/4 oz"),
    ("ST_SN_melba", "Melba toast", "4 pieces"),
    ("ST_SN_oyster", "Oyster crackers", "20"),
    ("ST_SN_popcorn", "Popcorn, popped", "3 cups"),
    ("ST_SN_pretzels", "Pretzels", "3/4 oz"),
    ("ST_SN_rice_cakes", "Rice cakes", "2"),
    ("ST_SN_chips_baked", "Snack chips (Baked)", "15-20 (3/4 oz)"),
    ("ST_SN_chips_regular", "Snack chips (Regular)", "9-13 (3/4 oz)"),
]
for id, n, p in _snacks:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Starches", "Snacks", "carb", 15, 3, 1, 80))

# --- Beans, Peas and Lentils ---
_beans = [
    ("ST_BP_baked_beans", "Baked beans", "1/3 cup"),
    ("ST_BP_beans_mixed", "Beans (black, garbanzo, kidney, lima, navy, pinto, white)", "1/2 cup"),
    ("ST_BP_lentils", "Lentils (brown, green, yellow)", "1/2 cup"),
    ("ST_BP_peas_split", "Peas (black-eyed, split)", "1/2 cup"),
    ("ST_BP_refried", "Refried beans, canned", "1/2 cup"),
]
for id, n, p in _beans:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Starches", "Beans, Peas and Lentils", "carb", 15, 3, 1, 80))


# ============================================================
#  FRUITS AND FRUIT JUICES
# ============================================================

_fruits = [
    ("FR_F_apple", "Apple, unpeeled, small", "1 (4 oz)"),
    ("FR_F_apple_dried", "Apples, dried", "4 rings"),
    ("FR_F_applesauce", "Applesauce, unsweetened", "1/2 cup"),
    ("FR_F_apricot", "Apricots, fresh", "4 whole (5 1/2 oz)"),
    ("FR_F_apricot_dried", "Apricot, dried", "8 halves"),
    ("FR_F_banana", "Banana", "1/2 large or 1 baby banana (4 oz)"),
    ("FR_F_blackberries", "Blackberries", "3/4 cup"),
    ("FR_F_blueberries", "Blueberries", "3/4 cup"),
    ("FR_F_cantaloupe", "Cantaloupe", "1 cup cubed (11 oz)"),
    ("FR_F_cherries_canned", "Cherries (Sweet, canned)", "1/2 cup"),
    ("FR_F_cherries_fresh", "Cherries (Sweet, fresh)", "12 (3 oz)"),
    ("FR_F_dates", "Dates", "3"),
    ("FR_F_dried_fruits", "Dried fruits", "2 Tbsp"),
    ("FR_F_figs", "Figs", "2 medium (3 1/2 oz)"),
    ("FR_F_fruit_cocktail", "Fruit cocktail", "1/2 cup"),
    ("FR_F_grapefruit", "Grapefruit (Large)", "1/2 (11 oz)"),
    ("FR_F_grapefruit_canned", "Grapefruit (Sections, canned)", "3/4 cup"),
    ("FR_F_grapes", "Grapes, small", "17 (3 oz)"),
    ("FR_F_honeydew", "Honeydew", "1 slice or 1 cup cubed (10 oz)"),
    ("FR_F_kiwi", "Kiwi", "1 (3 1/2 oz)"),
    ("FR_F_mandarin", "Mandarin oranges, canned", "3/4 cup"),
    ("FR_F_mango", "Mango", "1/2 cup or 1/2 small (5 1/2 oz)"),
    ("FR_F_nectarine", "Nectarine, small", "1 (5 oz)"),
    ("FR_F_orange", "Orange, small", "1 (6 1/2 oz)"),
    ("FR_F_papaya", "Papaya", "1 cup cubed (8 oz)"),
    ("FR_F_peach_canned", "Peach (Canned)", "1/2 cup"),
    ("FR_F_peach_fresh", "Peach (Fresh, medium)", "1 (6 oz)"),
    ("FR_F_pear_canned", "Pear (Canned)", "1/2 cup"),
    ("FR_F_pear_fresh", "Pear (Fresh, large)", "1/2 (4 oz)"),
    ("FR_F_pineapple_canned", "Pineapple (Canned)", "1/2 cup"),
    ("FR_F_pineapple_fresh", "Pineapple (Fresh)", "3/4 cup"),
]
for id, n, p in _fruits:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Fruits", "Fruits", "carb", 15, 0, 0, 60))

_fruit_juice = [
    ("FR_J_apple", "Apple juice and apple cider", "1/2 cup"),
    ("FR_J_blends", "Fruit juice blends, 100% juice", "1/3 cup"),
    ("FR_J_grape", "Grape juice", "1/3 cup"),
    ("FR_J_grapefruit", "Grapefruit juice", "1/2 cup"),
    ("FR_J_orange", "Orange juice", "1/2 cup"),
    ("FR_J_pineapple", "Pineapple juice", "1/2 cup"),
    ("FR_J_prune", "Prune juice", "1/3 cup"),
]
for id, n, p in _fruit_juice:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Fruits", "Fruit Juice", "carb", 15, 0, 0, 60))


# ============================================================
#  MILK, YOGURT, AND DAIRY-LIKE FOODS
# ============================================================

_milk_ff = [
    ("MK_FF_buttermilk", "Fat-free and low-fat buttermilk", "1 cup"),
    ("MK_FF_milk", "Fat-free milk", "1 cup"),
    ("MK_FF_lowfat_1", "Low-fat, 1% milk", "1 cup"),
    ("MK_FF_evaporated", "Evaporated fat-free milk", "1/2 cup"),
    ("MK_FF_dry", "Fat-free dry milk powder", "1/3 cup"),
    ("MK_FF_yogurt_flav", "Yogurt (fat-free flavored)", "2/3 cup"),
    ("MK_FF_yogurt_plain", "Yogurt (plain fat-free)", "2/3 cup"),
]
for id, n, p in _milk_ff:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Milk", "Fat-free and Low-fat", "mixed", 12, 8, 1, 100))

_milk_rf = [
    ("MK_RF_milk_2", "Milk, 2%", "1 cup"),
    ("MK_RF_kefir", "Kefir", "1 cup"),
    ("MK_RF_yogurt", "Yogurt, plain low-fat", "2/3 cup"),
    ("MK_RF_acidophilus", "Sweet acidophilus milk", "1 cup"),
]
for id, n, p in _milk_rf:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Milk", "Reduced-Fat", "mixed", 12, 8, 5, 120))

_milk_wh = [
    ("MK_WH_milk", "Milk, whole", "1 cup"),
    ("MK_WH_evaporated", "Evaporated whole milk", "1/2 cup"),
    ("MK_WH_yogurt", "Yogurt, plain (made from whole milk)", "8 oz"),
    ("MK_WH_goat", "Goat's milk", "1 cup"),
]
for id, n, p in _milk_wh:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Milk", "Whole Milk", "mixed", 12, 8, 8, 160))


# ============================================================
#  NON-STARCHY VEGETABLES
# ============================================================

_nonstarchy_veg = [
    ("VG_NS_amaranth", "Amaranth or Chinese spinach", "1/2 cup cooked"),
    ("VG_NS_artichoke", "Artichoke", "1/2 cup cooked"),
    ("VG_NS_artichoke_hearts", "Artichoke hearts", "1/2 cup cooked"),
    ("VG_NS_asparagus", "Asparagus", "1/2 cup cooked"),
    ("VG_NS_baby_corn", "Baby corn", "1/2 cup cooked"),
    ("VG_NS_bamboo", "Bamboo shoots", "1/2 cup cooked"),
    ("VG_NS_bean_sprouts", "Bean sprouts", "1/2 cup cooked"),
    ("VG_NS_beans_green", "Beans (green, wax, Italian)", "1/2 cup cooked"),
    ("VG_NS_beets", "Beets", "1/2 cup cooked"),
    ("VG_NS_broccoli", "Broccoli", "1/2 cup cooked"),
    ("VG_NS_brussels", "Brussels sprouts", "1/2 cup cooked"),
    ("VG_NS_cabbage", "Cabbage (green, bok choy, Chinese)", "1/2 cup cooked"),
    ("VG_NS_carrots", "Carrots", "1/2 cup cooked"),
    ("VG_NS_cauliflower", "Cauliflower", "1/2 cup cooked"),
    ("VG_NS_celery", "Celery", "1/2 cup cooked"),
    ("VG_NS_coleslaw", "Coleslaw, packaged, no dressing", "1/2 cup"),
    ("VG_NS_cucumber", "Cucumber", "1/2 cup cooked"),
    ("VG_NS_daikon", "Daikon", "1/2 cup cooked"),
    ("VG_NS_eggplant", "Eggplant", "1/2 cup cooked"),
    ("VG_NS_greens", "Greens (collard, kale, mustard, turnip)", "1/2 cup cooked"),
    ("VG_NS_palm_hearts", "Hearts of palm", "1/2 cup cooked"),
    ("VG_NS_jicama", "Jicama", "1/2 cup cooked"),
    ("VG_NS_kohlrabi", "Kohlrabi", "1/2 cup cooked"),
    ("VG_NS_leeks", "Leeks", "1/2 cup cooked"),
    ("VG_NS_mixed_veg", "Mixed vegetables", "1/2 cup cooked"),
    ("VG_NS_mushrooms", "Mushrooms, all kinds, fresh", "1/2 cup cooked"),
    ("VG_NS_okra", "Okra", "1/2 cup cooked"),
    ("VG_NS_onions", "Onions", "1/2 cup cooked"),
    ("VG_NS_pea_pods", "Pea pods", "1/2 cup cooked"),
    ("VG_NS_peppers", "Peppers (all varieties)", "1/2 cup cooked"),
    ("VG_NS_radishes", "Radishes", "1/2 cup cooked"),
    ("VG_NS_rutabaga", "Rutabaga", "1/2 cup cooked"),
    ("VG_NS_sauerkraut", "Sauerkraut", "1/2 cup"),
    ("VG_NS_spinach", "Spinach", "1/2 cup cooked"),
    ("VG_NS_squash_summer", "Squash, summer", "1/2 cup cooked"),
    ("VG_NS_sugar_snap", "Sugar snap peas", "1/2 cup cooked"),
    ("VG_NS_swiss_chard", "Swiss chard", "1/2 cup cooked"),
    ("VG_NS_tomato_fresh", "Tomato (Fresh)", "1/2 cup cooked"),
    ("VG_NS_tomato_canned", "Tomato (Canned)", "1/2 cup"),
    ("VG_NS_tomato_sauce", "Tomato sauce", "1/4 cup"),
    ("VG_NS_tomato_juice", "Tomato/vegetable juice", "1/2 cup"),
    ("VG_NS_turnips", "Turnips", "1/2 cup cooked"),
    ("VG_NS_water_chestnuts", "Water chestnuts", "1/2 cup cooked"),
    ("VG_NS_yard_long", "Yard-long beans", "1/2 cup cooked"),
    ("VG_NS_zucchini", "Zucchini", "1/2 cup cooked"),
]
for id, n, p in _nonstarchy_veg:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Vegetables", "Non-Starchy Vegetables", "carb", 5, 2, 0, 25))


# ============================================================
#  SWEETS, DESSERTS, AND OTHER CARBOHYDRATES
# ============================================================

_sweets = [
    ("SW_banana_chips", "Banana chips", "2 Tbsp", 10, 0, 4, 75),
    ("SW_brownie", "Brownie, small, unfrosted", "1 1/4 inch square", 15, 1, 7, 100),
    ("SW_cake_unfrosted", "Cake, unfrosted", "2-inch square", 15, 1, 5, 100),
    ("SW_cake_frosted", "Cake, frosted", "2-inch square", 30, 1, 8, 185),
    ("SW_cookie_sandwich", "Cookie, sandwich", "2 small", 15, 1, 4, 100),
    ("SW_cookie_sf", "Cookie, sugar-free", "3 small or 1 large", 15, 1, 5, 100),
    ("SW_cranberry", "Cranberry sauce, jellied", "1/4 cup", 15, 0, 0, 60),
    ("SW_cupcake", "Cupcake, frosted", "1 small", 30, 1, 5, 165),
    ("SW_doughnut_plain", "Doughnut, plain cake", "1 medium", 15, 2, 8, 120),
    ("SW_doughnut_glazed", "Doughnut, glazed", "3 3/4 inches across", 30, 2, 10, 200),
    ("SW_energy_bar", "Energy bar", "1 bar", 15, 2, 5, 100),
    ("SW_fruit_bar", "Fruit juice bars, frozen", "1 bar", 15, 0, 0, 60),
    ("SW_fruit_snacks", "Fruit snacks, chewy", "1 roll", 15, 0, 0, 60),
    ("SW_gelatin", "Gelatin, regular", "1/2 cup", 15, 2, 0, 70),
    ("SW_granola_bar", "Granola or snack bar", "1 bar", 15, 1, 5, 100),
    ("SW_honey", "Honey", "1 Tbsp", 15, 0, 0, 60),
    ("SW_ice_cream_light", "Ice cream (Light)", "1/2 cup", 15, 3, 5, 110),
    ("SW_ice_cream_reg", "Ice cream (Regular)", "1/2 cup", 15, 3, 7, 125),
    ("SW_ice_cream_ff", "Ice cream (Fat-free, no sugar added)", "1/2 cup", 15, 3, 0, 70),
    ("SW_jam", "Jam or jelly, regular", "1 Tbsp", 15, 0, 0, 60),
    ("SW_pie_fruit", "Pie, commercially prepared fruit", "1/6 of 8-inch pie", 30, 2, 7, 185),
    ("SW_pie_pumpkin", "Pie, pumpkin or custard", "1/8 of 8-inch pie", 15, 3, 5, 110),
    ("SW_pudding_reg", "Pudding, regular", "1/2 cup", 30, 3, 3, 155),
    ("SW_pudding_sf", "Pudding, sugar-free", "1/2 cup", 15, 3, 0, 70),
    ("SW_sherbet", "Sherbet, sorbet", "1/2 cup", 30, 1, 0, 125),
    ("SW_sports_drink", "Sports drinks", "8 oz (1 cup)", 15, 0, 0, 60),
    ("SW_sugar", "Sugar", "1 Tbsp", 15, 0, 0, 60),
    ("SW_sweet_roll", "Sweet roll or Danish", "1 (2 1/2 oz)", 30, 3, 8, 200),
    ("SW_syrup_light", "Syrup (Light)", "2 Tbsp", 15, 0, 0, 60),
    ("SW_syrup_reg", "Syrup (Regular)", "1 Tbsp", 15, 0, 0, 60),
    ("SW_yogurt_frozen", "Yogurt, frozen, fat-free", "1/3 cup", 15, 2, 0, 70),
]
for id, n, p, c, pro, f, cal in _sweets:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Sweets", "Sweets, Desserts, and Other Carbohydrates", "carb", c, pro, f, cal))


# ============================================================
#  MEATS AND MEAT SUBSTITUTES
# ============================================================

_lean_meat = [
    ("MT_LN_beef", "Beef (lean grades)", "1 oz"),
    ("MT_LN_jerky", "Beef jerky", "1 oz"),
    ("MT_LN_cheese_lowfat", "Cheeses (3g fat or less)", "1 oz"),
    ("MT_LN_tuna", "Canned tuna (water-packed)", "1 oz"),
    ("MT_LN_cottage", "Cottage cheese", "1/4 cup"),
    ("MT_LN_egg_sub", "Egg substitutes, plain", "1/4 cup"),
    ("MT_LN_egg_whites", "Egg whites", "2"),
    ("MT_LN_fish", "Fish, fresh or frozen, plain", "1 oz"),
    ("MT_LN_fish_smoked", "Fish, smoked (herring or salmon)", "1 oz"),
    ("MT_LN_game", "Game (buffalo, ostrich, rabbit, venison)", "1 oz"),
    ("MT_LN_hotdog_lean", "Hot dog (3g fat or less)", "1"),
    ("MT_LN_lamb", "Lamb (chop, leg, or roast)", "1 oz"),
    ("MT_LN_organ", "Organ meats (heart, kidney, liver)", "1 oz"),
    ("MT_LN_oysters", "Oysters, fresh or frozen", "6 medium"),
    ("MT_LN_pork_lean", "Pork, lean", "1 oz"),
    ("MT_LN_poultry", "Poultry without skin", "1 oz"),
    ("MT_LN_sandwich_lean", "Processed sandwich meats (3g fat or less)", "1 oz"),
    ("MT_LN_salmon_canned", "Salmon, canned", "1 oz"),
    ("MT_LN_sardines", "Sardines, canned", "2 medium"),
    ("MT_LN_shellfish", "Shellfish", "1 oz"),
    ("MT_LN_veal", "Veal (lean chop, roast)", "1 oz"),
]
for id, n, p in _lean_meat:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Meat", "Lean Meat and Substitutes", "protein", 0, 7, 3, 45))

_med_meat = [
    ("MT_MF_beef", "Beef (medium fat grades)", "1 oz"),
    ("MT_MF_cheese", "Cheeses (4-7g fat)", "1 oz"),
    ("MT_MF_egg", "Egg", "1"),
    ("MT_MF_fish_fried", "Fish, any fried product", "1 oz"),
    ("MT_MF_lamb", "Lamb (ground, rib roast)", "1 oz"),
    ("MT_MF_pork", "Pork (cutlet, shoulder roast)", "1 oz"),
    ("MT_MF_poultry_skin", "Poultry with skin", "1 oz"),
    ("MT_MF_ricotta", "Ricotta cheese", "2 oz or 1/4 cup"),
    ("MT_MF_sausage", "Sausage (4-7g fat)", "1 oz"),
    ("MT_MF_tofu", "Tofu", "4 oz or 1/2 cup"),
]
for id, n, p in _med_meat:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Meat", "Medium-Fat Meat and Substitutes", "protein", 0, 7, 5, 75))

_high_meat = [
    ("MT_HF_bacon", "Bacon, pork", "2 slices"),
    ("MT_HF_bacon_turkey", "Bacon, turkey", "3 slices"),
    ("MT_HF_cheese_reg", "Cheese, regular", "1 oz"),
    ("MT_HF_hotdog_reg", "Hot dog (beef or pork)", "1"),
    ("MT_HF_hotdog_turkey", "Hot dog (turkey or chicken)", "1"),
    ("MT_HF_peanut_butter", "Peanut butter", "1 Tbsp"),
    ("MT_HF_pork_ground", "Pork (ground, sausage, spareribs)", "1 oz"),
    ("MT_HF_sandwich_fat", "Processed sandwich meats (8g fat+)", "1 oz"),
    ("MT_HF_sausage_fat", "Sausage (8g fat+)", "1 oz"),
]
for id, n, p in _high_meat:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Meat", "High-Fat Meat and Substitutes", "protein", 0, 7, 8, 100))

_plant_protein = [
    ("MT_PL_baked_beans", "Baked beans", "1/3 cup", 7, 7, 1, 60),
    ("MT_PL_beans_mixed", "Beans (mixed), cooked", "1/2 cup", 7, 7, 1, 60),
    ("MT_PL_edamame", "Edamame", "1/2 cup", 7, 7, 3, 75),
    ("MT_PL_falafel", "Falafel", "3 patties", 7, 7, 6, 100),
    ("MT_PL_hummus", "Hummus", "1/3 cup", 7, 7, 6, 100),
    ("MT_PL_lentils", "Lentils", "1/2 cup", 7, 7, 1, 60),
    ("MT_PL_burger_soy", "Meatless burger, soy based", "3 oz", 7, 7, 5, 90),
    ("MT_PL_burger_veg", "Meatless burger, veg based", "1 patty", 7, 7, 5, 90),
    ("MT_PL_deli", "Meatless deli slices", "1 oz", 7, 7, 1, 60),
    ("MT_PL_miso", "Miso", "3 Tbsp", 7, 7, 3, 75),
    ("MT_PL_mycoprotein", "Mycoprotein", "2 oz", 7, 7, 3, 75),
    ("MT_PL_nut_spread", "Nut spreads", "1 Tbsp", 7, 7, 8, 100),
    ("MT_PL_peas_split", "Peas (split), cooked", "1/2 cup", 7, 7, 1, 60),
    ("MT_PL_soy_nuts", "Soy nuts", "3/4 oz", 7, 7, 5, 90),
    ("MT_PL_tempeh", "Tempeh", "1/4 cup", 7, 7, 5, 90),
    ("MT_PL_tofu_light", "Tofu, light", "4 oz or 1/2 cup", 7, 7, 3, 75),
]
for id, n, p, c, pro, f, cal in _plant_protein:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Meat", "Plant-Based Protein", "protein", c, pro, f, cal))


# ============================================================
#  FATS
# ============================================================

_mono_fats = [
    ("FT_MN_avocado", "Avocado, medium", "2 Tbsp (1 oz)"),
    ("FT_MN_nut_butter", "Nut butters", "1 1/2 tsp"),
    ("FT_MN_almonds", "Almonds", "6 nuts"),
    ("FT_MN_brazil", "Brazil nuts", "2 nuts"),
    ("FT_MN_cashews", "Cashews", "6 nuts"),
    ("FT_MN_filberts", "Filberts (hazelnuts)", "5 nuts"),
    ("FT_MN_macadamia", "Macadamia", "3 nuts"),
    ("FT_MN_mixed_nuts", "Mixed nuts", "6 nuts"),
    ("FT_MN_peanuts", "Peanuts", "10 nuts"),
    ("FT_MN_pecans", "Pecans", "4 halves"),
    ("FT_MN_pistachios", "Pistachios", "16 nuts"),
    ("FT_MN_oil_canola", "Oil (canola, olive, peanut)", "1 tsp"),
    ("FT_MN_olives_black", "Olives, ripe (black)", "8 large"),
    ("FT_MN_olives_green", "Olives, green, stuffed", "10 large"),
]
for id, n, p in _mono_fats:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Fats", "Monounsaturated Fats", "fat", 0, 0, 5, 45))

_poly_fats = [
    ("FT_PL_margarine_spread", "Margarine spread", "1 Tbsp"),
    ("FT_PL_margarine_stick", "Margarine stick", "1 tsp"),
    ("FT_PL_mayo_reduced", "Mayonnaise (Reduced-fat)", "1 Tbsp"),
    ("FT_PL_mayo_reg", "Mayonnaise (Regular)", "1 tsp"),
    ("FT_PL_mayo_style_red", "Mayonnaise-style dressing (Reduced-fat)", "1 Tbsp"),
    ("FT_PL_mayo_style_reg", "Mayonnaise-style dressing (Regular)", "2 tsp"),
    ("FT_PL_oil_poly", "Oil (corn, cottonseed, flax, etc.)", "1 tsp"),
    ("FT_PL_oil_enova", "Oil (Enova)", "1 tsp"),
    ("FT_PL_stanol_light", "Plant stanol esters (light)", "1 Tbsp"),
    ("FT_PL_stanol_reg", "Plant stanol esters (regular)", "2 tsp"),
    ("FT_PL_salad_red", "Salad dressing (Reduced-fat)", "2 Tbsp"),
    ("FT_PL_salad_reg", "Salad dressing (Regular)", "1 Tbsp"),
    ("FT_PL_flaxseed", "Flaxseed, whole", "1 Tbsp"),
    ("FT_PL_seeds_pumpkin", "Seeds (pumpkin, sunflower)", "1 Tbsp"),
    ("FT_PL_seeds_sesame", "Seeds (sesame)", "1 Tbsp"),
    ("FT_PL_tahini", "Tahini", "2 tsp"),
    ("FT_PL_walnuts", "Walnuts, English", "4 halves"),
]
for id, n, p in _poly_fats:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Fats", "Polyunsaturated Fats", "fat", 0, 0, 5, 45))

_sat_fats = [
    ("FT_ST_bacon", "Bacon, cooked", "1 slice"),
    ("FT_ST_butter_red", "Butter (Reduced-fat)", "1 Tbsp"),
    ("FT_ST_butter_stick", "Butter (Stick)", "1 tsp"),
    ("FT_ST_butter_whipped", "Butter (Whipped)", "2 tsp"),
    ("FT_ST_butter_blend_red", "Butter blend (Reduced-fat)", "1 Tbsp"),
    ("FT_ST_butter_blend_reg", "Butter blend (Regular)", "1 1/2 tsp"),
    ("FT_ST_chitterlings", "Chitterlings, boiled", "2 Tbsp"),
    ("FT_ST_coconut", "Coconut, shredded", "2 Tbsp"),
    ("FT_ST_coconut_milk_light", "Coconut milk (Light)", "1/3 cup"),
    ("FT_ST_coconut_milk_reg", "Coconut milk (Regular)", "1 1/2 Tbsp"),
    ("FT_ST_cream_half", "Cream (Half and half)", "2 Tbsp"),
    ("FT_ST_cream_heavy", "Cream (Heavy)", "1 Tbsp"),
    ("FT_ST_cream_light", "Cream (Light)", "1 1/2 Tbsp"),
    ("FT_ST_cream_whipped", "Cream (Whipped)", "2 Tbsp"),
    ("FT_ST_cream_whipped_press", "Cream (Whipped, pressurized)", "1/4 cup"),
    ("FT_ST_cream_cheese_red", "Cream cheese (Reduced-fat)", "1 1/2 Tbsp"),
    ("FT_ST_cream_cheese_reg", "Cream cheese (Regular)", "1 Tbsp"),
    ("FT_ST_lard", "Lard", "1 tsp"),
    ("FT_ST_oil_sat", "Oil (coconut, palm, palm kernel)", "1 tsp"),
    ("FT_ST_salt_pork", "Salt pork", "1/4 oz"),
    ("FT_ST_shortening", "Shortening, solid", "1 tsp"),
    ("FT_ST_sour_cream_red", "Sour cream (Reduced-fat)", "3 Tbsp"),
    ("FT_ST_sour_cream_reg", "Sour cream (Regular)", "2 Tbsp"),
]
for id, n, p in _sat_fats:
    EXCHANGE_LIST_INITIAL.append(_item(id, n, p, "Fats", "Saturated Fats", "fat", 0, 0, 5, 45))
