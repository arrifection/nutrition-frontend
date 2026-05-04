import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const PDF_TEMPLATE_OPTIONS = [
    { id: "clinical-classic", name: "Clinical Classic" },
    { id: "green-minimal", name: "Green Minimal" },
    { id: "structured-chart", name: "Structured Chart" },
    { id: "consultation-summary", name: "Consultation Summary" },
    { id: "modern-blue", name: "Modern Blue" },
];

const PDF_TEMPLATE_STYLES = {
    "clinical-classic": {
        title: "Clinical Diet Plan Report",
        accent: [37, 99, 235],
        accentLight: [239, 246, 255],
        text: [15, 23, 42],
        headingText: [255, 255, 255],
        tableTheme: "grid",
    },
    "green-minimal": {
        title: "Nutrition Care Plan",
        accent: [22, 163, 74],
        accentLight: [240, 253, 244],
        text: [20, 83, 45],
        headingText: [255, 255, 255],
        tableTheme: "plain",
    },
    "structured-chart": {
        title: "Clinical Diet Record",
        accent: [51, 65, 85],
        accentLight: [241, 245, 249],
        text: [15, 23, 42],
        headingText: [255, 255, 255],
        tableTheme: "grid",
    },
    "consultation-summary": {
        title: "Consultation Summary",
        accent: [100, 116, 139],
        accentLight: [248, 250, 252],
        text: [30, 41, 59],
        headingText: [255, 255, 255],
        tableTheme: "plain",
    },
    "modern-blue": {
        title: "Diet Plan Report",
        accent: [29, 78, 216],
        accentLight: [239, 246, 255],
        text: [15, 23, 42],
        headingText: [255, 255, 255],
        tableTheme: "grid",
    },
};

const formatReportDate = (date = new Date()) => {
    const value = date instanceof Date ? date : new Date(`${date}T00:00:00`);
    if (Number.isNaN(value.getTime())) return String(date || "-");
    return value.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).replace(",", "");
};

export function generateDietPlanPDF({
    patientData,
    macroTargets,
    weekPlan,
    dietaryFocus = "",
    selectedDay = null,
    templateId = "clinical-classic"
}) {
    try {
        console.log("Starting PDF generation...", { patientData, macroTargets, weekPlan, templateId });

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const template = PDF_TEMPLATE_STYLES[templateId] || PDF_TEMPLATE_STYLES["clinical-classic"];
        let y = 18;

        if (!patientData) {
            alert("No patient data found. Please complete Step 1.");
            return;
        }

        const patientName = patientData.name || patientData.patient_name || "Patient";
        const reportDate = formatReportDate(new Date());

        const addReportHeader = () => {
            if (templateId === "modern-blue") {
                doc.setFillColor(...template.accent);
                doc.rect(0, 0, pageWidth, 34, "F");
                doc.setTextColor(...template.headingText);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.text("Diet Plan Report", 14, 16);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text(`Patient: ${patientName}`, 14, 25);
                doc.text(`Date: ${reportDate}`, 78, 25);
                doc.text(`Goal: ${patientData.goal || "-"}`, 130, 25);
                y = 45;
                return;
            }

            doc.setTextColor(...template.text);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(templateId === "consultation-summary" ? 18 : 16);
            doc.text(template.title, 14, y);
            y += 8;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text(`${patientName}  |  ${reportDate}`, 14, y);
            doc.setDrawColor(...template.accent);
            doc.setLineWidth(templateId === "green-minimal" ? 0.5 : 0.8);
            doc.line(14, y + 5, pageWidth - 14, y + 5);
            y += 16;
        };

        // Helper to add section heading
        const addHeading = (text, size = 14) => {
            if (y > pageHeight - 35) {
                doc.addPage();
                y = 18;
            }
            doc.setFillColor(...template.accent);
            doc.roundedRect(14, y - 5, pageWidth - 28, 8, 1.5, 1.5, "F");
            doc.setTextColor(...template.headingText);
            doc.setFontSize(size > 12 ? 11 : size);
            doc.setFont("helvetica", "bold");
            doc.text(text, 17, y);
            y += 10;
            doc.setTextColor(...template.text);
        };

        // Helper to add label-value pair
        const addField = (label, value, col = 14) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...template.text);
            doc.text(label + ":", col, y);
            doc.setFont("helvetica", "normal");
            doc.text(String(value || "-"), col + 40, y);
            y += 6;
        };

        addReportHeader();

        // ==========================================
        // SECTION 1: PATIENT INFORMATION
        // ==========================================
        addHeading("Patient Information", 14);
        y += 2;

        if (patientData) {
            addField("Patient Name", patientData.name);
            addField("Age", `${patientData.age} years`);
            addField("Gender", patientData.gender);
            addField("Height", `${patientData.height} cm`);
            addField("Weight", `${patientData.weight} kg`);
            addField("Activity Level", patientData.activity_level);
            addField("Goal", patientData.goal);
            addField("Date of Plan", reportDate);

            if (patientData.medical_notes) {
                y += 2;
                doc.setFont("helvetica", "bold");
                doc.text("Notes:", 14, y);
                y += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                const notes = doc.splitTextToSize(patientData.medical_notes, pageWidth - 28);
                doc.text(notes, 14, y);
                y += notes.length * 4 + 4;
            }
        }

        y += 8;

        // ==========================================
        // SECTION 2: ENERGY & MACRONUTRIENT SUMMARY
        // ==========================================
        addHeading("Daily Energy & Macronutrient Targets", 14);
        y += 2;

        if (macroTargets) {
            const totalCals = macroTargets.calories || 2000;
            const carbsPct = Math.round((macroTargets.carbs * 4 / totalCals) * 100);
            const proteinPct = Math.round((macroTargets.protein * 4 / totalCals) * 100);
            const fatPct = Math.round((macroTargets.fat * 9 / totalCals) * 100);

            autoTable(doc, {
                startY: y,
                head: [["Nutrient", "Grams", "Percentage"]],
                body: [
                    ["Total Calories", `${totalCals} kcal`, "100%"],
                    ["Carbohydrates", `${macroTargets.carbs}g`, `${carbsPct}%`],
                    ["Protein", `${macroTargets.protein}g`, `${proteinPct}%`],
                    ["Fat", `${macroTargets.fat}g`, `${fatPct}%`],
                ],
                theme: template.tableTheme,
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fontStyle: "bold", fillColor: template.accent, textColor: template.headingText },
                alternateRowStyles: { fillColor: template.accentLight },
                columnStyles: { 0: { fontStyle: "bold" } },
                tableLineColor: template.accent,
                tableLineWidth: 0.1,
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // ==========================================
        // SECTION 3: DIETARY FOCUS / APPROACH
        // ==========================================
        if (dietaryFocus && dietaryFocus.trim()) {
            addHeading("Dietary Focus / Approach", 14);
            y += 2;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const focusLines = doc.splitTextToSize(dietaryFocus, pageWidth - 28);
            doc.text(focusLines, 14, y);
            y += focusLines.length * 5 + 8;
        }

        // ==========================================
        // SECTION 4: DAILY MEAL PLAN
        // ==========================================
        const days = selectedDay ? [selectedDay] : Object.keys(weekPlan || {});

        days.forEach((day, dayIndex) => {
            const dayMeals = weekPlan?.[day] || {};

            // Check if need new page
            if (y > 220) {
                doc.addPage();
                y = 20;
            }

            addHeading(`Daily Meal Plan - ${day}`, 14);
            y += 2;

            const mealTypes = [
                { key: "breakfast", label: "Breakfast" },
                { key: "snack", label: "Mid-morning Snack" },
                { key: "lunch", label: "Lunch" },
                { key: "dinner", label: "Dinner" },
            ];

            const tableData = [];

            mealTypes.forEach(({ key, label }) => {
                const foods = dayMeals[key] || [];
                if (foods.length === 0) {
                    tableData.push([label, "-", "-", "-", "-", "-"]);
                } else {
                    // Always use English names in PDF (jsPDF cannot render Urdu/Arabic script)
                    const foodNames = foods.map(f => {
                        return f.food_name?.en || f.name || "Unknown";
                    }).join(", ");

                    // Use the new macros structure if available, fallback to old flat structure
                    const getVal = (f, key, oldKey) => (f.macros ? f.macros[key] : f[oldKey]) || 0;

                    const totalCals = foods.reduce((s, f) => s + getVal(f, "calories", "calories"), 0);
                    const totalCarbs = foods.reduce((s, f) => s + getVal(f, "carbs_g", "carbohydrates"), 0);
                    const totalProtein = foods.reduce((s, f) => s + getVal(f, "protein_g", "protein"), 0);
                    const totalFat = foods.reduce((s, f) => s + getVal(f, "fat_g", "fat"), 0);

                    tableData.push([
                        label,
                        foodNames,
                        Math.round(totalCals),
                        Math.round(totalCarbs),
                        Math.round(totalProtein),
                        Math.round(totalFat),
                    ]);
                }
            });

            // Add totals row
            const allFoods = Object.values(dayMeals).flat();
            const getVal = (f, key, oldKey) => (f.macros ? f.macros[key] : f[oldKey]) || 0;
            const dayTotals = allFoods.reduce(
                (acc, f) => ({
                    cals: acc.cals + getVal(f, "calories", "calories"),
                    carbs: acc.carbs + getVal(f, "carbs_g", "carbohydrates"),
                    protein: acc.protein + getVal(f, "protein_g", "protein"),
                    fat: acc.fat + getVal(f, "fat_g", "fat"),
                }),
                { cals: 0, carbs: 0, protein: 0, fat: 0 }
            );

            tableData.push([
                "TOTAL",
                "",
                Math.round(dayTotals.cals),
                Math.round(dayTotals.carbs),
                Math.round(dayTotals.protein),
                Math.round(dayTotals.fat),
            ]);

            autoTable(doc, {
                startY: y,
                head: [["Meal", "Foods", "Calories", "Carbs (g)", "Protein (g)", "Fat (g)"]],
                body: tableData,
                theme: template.tableTheme,
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fontStyle: "bold", fillColor: template.accent, textColor: template.headingText },
                alternateRowStyles: { fillColor: template.accentLight },
                columnStyles: {
                    0: { fontStyle: "bold", cellWidth: 30 },
                    1: { cellWidth: 60 },
                },
                tableLineColor: template.accent,
                tableLineWidth: 0.1,
                didParseCell: (data) => {
                    if (data.row.index === tableData.length - 1) {
                        data.cell.styles.fontStyle = "bold";
                    }
                },
            });

            y = doc.lastAutoTable.finalY + 10;

            // ==========================================
            // NEW SECTION: DAILY EXCHANGE SUMMARY (Per Day)
            // ==========================================
            if (allFoods.length > 0) {
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text("Daily Exchange Summary:", 14, y);
                y += 6;

                // Count servings per group
                const exchangeCounts = allFoods.reduce((acc, f) => {
                    const group = f.group?.en || f.group || "Other";
                    acc[group] = (acc[group] || 0) + 1;
                    return acc;
                }, {});

                const groupsToShow = [
                    "Starches",
                    "Fruits",
                    "Milk",
                    "Vegetables",
                    "Meat",
                    "Fats",
                    "Sweets"
                ];

                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                let countX = 14;
                groupsToShow.forEach((g, idx) => {
                    const count = exchangeCounts[g] || 0;
                    if (countX > 160) {
                        countX = 14;
                        y += 5;
                    }
                    doc.text(`${g}: ${count}`, countX, y);
                    countX += 45;
                });
                y += 10;
            }
        });

        // ==========================================
        // SECTION 5: WEEKLY OVERVIEW (if showing all days)
        // ==========================================
        if (!selectedDay && weekPlan) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }

            addHeading("Weekly Summary", 14);
            y += 2;

            const summaryData = [];
            Object.keys(weekPlan).forEach((day) => {
                const dayMeals = weekPlan[day] || {};
                const allFoods = Object.values(dayMeals).flat();
                const getVal = (f, key, oldKey) => (f.macros ? f.macros[key] : f[oldKey]) || 0;
                const totalCals = allFoods.reduce((s, f) => s + getVal(f, "calories", "calories"), 0);
                const itemCount = allFoods.length;

                summaryData.push([day, itemCount, Math.round(totalCals)]);
            });

            autoTable(doc, {
                startY: y,
                head: [["Day", "Items", "Total Calories"]],
                body: summaryData,
                theme: template.tableTheme,
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fontStyle: "bold", fillColor: template.accent, textColor: template.headingText },
                alternateRowStyles: { fillColor: template.accentLight },
                columnStyles: { 0: { fontStyle: "bold" } },
                tableLineColor: template.accent,
                tableLineWidth: 0.1,
            });
        }

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Template: ${PDF_TEMPLATE_OPTIONS.find((item) => item.id === templateId)?.name || "Clinical Classic"}`, 14, pageHeight - 10);

        // Save the PDF
        const templateSlug = templateId.replace(/[^a-z0-9]+/gi, "_");
        const fileName = patientData?.name
            ? `Diet_Plan_${patientData.name.replace(/\s+/g, "_")}_${templateSlug}.pdf`
            : "Diet_Plan.pdf";

        doc.save(fileName);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Could not generate PDF: " + error.message);
    }
}
