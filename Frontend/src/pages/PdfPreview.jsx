import { useMemo, useState } from "react";

const sampleData = {
    patient_name: "Sarah Ahmed",
    age: 21,
    sex: "Female",
    consultation_date: "2026-05-03",
    primary_goal: "Fat Loss",
    activity_level: "Sedentary",
    height: "5'5",
    weight: "58 kg",
    bmi: "21.3",
    calories_target: 1500,
    protein_g: 90,
    carbs_g: 150,
    fat_g: 50,
    meals: [
        { name: "Breakfast", items: ["Oats + milk", "1 banana"] },
        { name: "Lunch", items: ["2 roti", "chicken curry"] },
        { name: "Dinner", items: ["rice", "dal"] },
    ],
    allergies: "None",
    medical_notes: "No major issues",
    special_instructions: "Increase water intake",
    follow_up_date: "2026-05-15",
    clinician_name: "Dietitian Sarah",
};

const formatReportDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).replace(",", "");
};

const templates = [
    { id: "clinical-classic", name: "Clinical Classic" },
    { id: "green-minimal", name: "Green Minimal" },
    { id: "structured-chart", name: "Structured Chart" },
    { id: "executive-summary", name: "Consultation Summary" },
    { id: "modern-blue", name: "Modern Blue" },
];

function FieldGrid({ items }) {
    return (
        <div className="pdf-field-grid">
            {items.map((item) => (
                <div className="pdf-field" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                </div>
            ))}
        </div>
    );
}

function MacroStrip({ data }) {
    return (
        <div className="pdf-macro-strip">
            <div>
                <span>Calories</span>
                <strong>{data.calories_target}</strong>
                <small>kcal/day</small>
            </div>
            <div>
                <span>Protein</span>
                <strong>{data.protein_g}g</strong>
                <small>daily target</small>
            </div>
            <div>
                <span>Carbs</span>
                <strong>{data.carbs_g}g</strong>
                <small>daily target</small>
            </div>
            <div>
                <span>Fat</span>
                <strong>{data.fat_g}g</strong>
                <small>daily target</small>
            </div>
        </div>
    );
}

function MealRows({ data }) {
    return (
        <tbody>
            {data.meals.map((meal) => (
                <tr key={meal.name}>
                    <th>{meal.name}</th>
                    <td>{meal.items.join(", ")}</td>
                </tr>
            ))}
        </tbody>
    );
}

function Footer({ data }) {
    return (
        <footer className="pdf-footer">
            <span>Prepared by {data.clinician_name}</span>
            <span>Follow-up: {formatReportDate(data.follow_up_date)}</span>
        </footer>
    );
}

function ClinicalClassic({ data }) {
    return (
        <article className="pdf-sheet pdf-template clinical-classic">
            <header className="pdf-header">
                <div>
                    <p>Clinical Nutrition Plan</p>
                    <h1>{data.patient_name}</h1>
                </div>
                <div className="pdf-date-block">
                    <span>Consultation</span>
                    <strong>{formatReportDate(data.consultation_date)}</strong>
                </div>
            </header>

            <section className="pdf-section">
                <h2>Patient Profile</h2>
                <FieldGrid
                    items={[
                        { label: "Age / Sex", value: `${data.age} / ${data.sex}` },
                        { label: "Goal", value: data.primary_goal },
                        { label: "Activity", value: data.activity_level },
                        { label: "Height", value: data.height },
                        { label: "Weight", value: data.weight },
                        { label: "BMI", value: data.bmi },
                    ]}
                />
            </section>

            <section className="pdf-section">
                <h2>Daily Targets</h2>
                <MacroStrip data={data} />
            </section>

            <section className="pdf-section">
                <h2>Meal Prescription</h2>
                <table className="pdf-table">
                    <MealRows data={data} />
                </table>
            </section>

            <section className="pdf-section two-col-notes">
                <div>
                    <h2>Clinical Notes</h2>
                    <p>{data.medical_notes}</p>
                </div>
                <div>
                    <h2>Instructions</h2>
                    <p>{data.special_instructions}</p>
                    <p>Allergies: {data.allergies}</p>
                </div>
            </section>
            <Footer data={data} />
        </article>
    );
}

function GreenMinimal({ data }) {
    return (
        <article className="pdf-sheet pdf-template green-minimal">
            <header className="minimal-header">
                <div>
                    <span>Nutrition Care Summary</span>
                    <h1>{data.patient_name}</h1>
                    <p>{data.primary_goal} plan prepared on {formatReportDate(data.consultation_date)}</p>
                </div>
                <strong>{data.calories_target} kcal</strong>
            </header>

            <section className="soft-panel">
                <FieldGrid
                    items={[
                        { label: "Age", value: data.age },
                        { label: "Sex", value: data.sex },
                        { label: "Activity Level", value: data.activity_level },
                        { label: "Height", value: data.height },
                        { label: "Weight", value: data.weight },
                        { label: "BMI", value: data.bmi },
                    ]}
                />
            </section>

            <section className="pdf-section">
                <h2>Daily Nutrition Targets</h2>
                <MacroStrip data={data} />
            </section>

            <section className="minimal-meals">
                <h2>Meals</h2>
                {data.meals.map((meal) => (
                    <div key={meal.name}>
                        <strong>{meal.name}</strong>
                        <span>{meal.items.join(" + ")}</span>
                    </div>
                ))}
            </section>

            <section className="instruction-band">
                <span>Plan Notes</span>
                <p>{data.medical_notes}. {data.special_instructions}. Allergies: {data.allergies}.</p>
            </section>
            <Footer data={data} />
        </article>
    );
}

function StructuredChart({ data }) {
    const chartFields = [
        ["Patient", data.patient_name],
        ["Date", formatReportDate(data.consultation_date)],
        ["Age", data.age],
        ["Sex", data.sex],
        ["Goal", data.primary_goal],
        ["Activity", data.activity_level],
        ["Height", data.height],
        ["Weight", data.weight],
        ["BMI", data.bmi],
        ["Allergies", data.allergies],
    ];

    return (
        <article className="pdf-sheet pdf-template structured-chart">
            <header className="chart-header">
                <h1>Clinical Diet Record</h1>
                <span>Daily plan worksheet</span>
            </header>

            <section className="chart-grid">
                {chartFields.map(([label, value]) => (
                    <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </section>

            <section className="chart-targets">
                <div>
                    <span>Energy</span>
                    <strong>{data.calories_target}</strong>
                    <small>kcal</small>
                </div>
                <div>
                    <span>Protein</span>
                    <strong>{data.protein_g}g</strong>
                </div>
                <div>
                    <span>Carbs</span>
                    <strong>{data.carbs_g}g</strong>
                </div>
                <div>
                    <span>Fat</span>
                    <strong>{data.fat_g}g</strong>
                </div>
            </section>

            <section>
                <h2>Meal Chart</h2>
                <table className="chart-table">
                    <thead>
                        <tr>
                            <th>Meal</th>
                            <th>Items</th>
                            <th>Clinical Check</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.meals.map((meal) => (
                            <tr key={meal.name}>
                                <td>{meal.name}</td>
                                <td>{meal.items.join(", ")}</td>
                                <td>Reviewed</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="chart-notes">
                <div><span>Medical Notes</span><p>{data.medical_notes}</p></div>
                <div><span>Special Instructions</span><p>{data.special_instructions}</p></div>
            </section>
            <Footer data={data} />
        </article>
    );
}

function ExecutiveSummary({ data }) {
    return (
        <article className="pdf-sheet pdf-template executive-summary">
            <header className="executive-header">
                <span>Nutrition Plan</span>
                <h1>Consultation Summary</h1>
                <p>{data.patient_name} · {formatReportDate(data.consultation_date)}</p>
            </header>

            <section className="summary-lead">
                <h2>Clinical Objective</h2>
                <p>
                    {data.patient_name} is following a {data.primary_goal.toLowerCase()} nutrition plan with a daily
                    target of {data.calories_target} kcal. Current BMI is {data.bmi}, with activity level recorded as
                    {` ${data.activity_level.toLowerCase()}`}.
                </p>
            </section>

            <section className="summary-cards">
                <div><span>Protein</span><strong>{data.protein_g}g</strong></div>
                <div><span>Carbohydrate</span><strong>{data.carbs_g}g</strong></div>
                <div><span>Fat</span><strong>{data.fat_g}g</strong></div>
            </section>

            <section className="summary-block">
                <h2>Meal Direction</h2>
                {data.meals.map((meal) => (
                    <p key={meal.name}><strong>{meal.name}:</strong> {meal.items.join(", ")}.</p>
                ))}
            </section>

            <section className="summary-block">
                <h2>Care Notes</h2>
                <p>{data.medical_notes}. Allergies: {data.allergies}. {data.special_instructions}.</p>
            </section>

            <section className="signature-row">
                <div>
                    <span>Clinician</span>
                    <strong>{data.clinician_name}</strong>
                </div>
                <div>
                    <span>Follow-up Date</span>
                    <strong>{formatReportDate(data.follow_up_date)}</strong>
                </div>
            </section>
        </article>
    );
}

function ModernBlue({ data }) {
    return (
        <article className="pdf-sheet pdf-template modern-blue">
            <header className="modern-header">
                <div>
                    <span>Diet Plan Report</span>
                    <h1>Diet Plan Report</h1>
                </div>
                <div className="modern-report-meta">
                    <div>
                        <span>Patient</span>
                        <strong>{data.patient_name}</strong>
                    </div>
                    <div>
                        <span>Date</span>
                        <strong>{formatReportDate(data.consultation_date)}</strong>
                    </div>
                    <div>
                        <span>Goal</span>
                        <strong>{data.primary_goal}</strong>
                    </div>
                </div>
            </header>

            <section className="modern-stats">
                <div><span>Calories</span><strong>{data.calories_target}</strong><small>kcal</small></div>
                <div><span>Protein</span><strong>{data.protein_g}g</strong></div>
                <div><span>Carbs</span><strong>{data.carbs_g}g</strong></div>
                <div><span>Fat</span><strong>{data.fat_g}g</strong></div>
            </section>

            <section className="modern-layout">
                <div>
                    <h2>Profile</h2>
                    <FieldGrid
                        items={[
                            { label: "Age / Sex", value: `${data.age} / ${data.sex}` },
                            { label: "Activity", value: data.activity_level },
                            { label: "Height", value: data.height },
                            { label: "Weight", value: data.weight },
                            { label: "BMI", value: data.bmi },
                            { label: "Allergies", value: data.allergies },
                        ]}
                    />
                </div>
                <div className="modern-note">
                    <h2>Clinical Notes</h2>
                    <p>{data.medical_notes}</p>
                    <h2>Instructions</h2>
                    <p>{data.special_instructions}</p>
                </div>
            </section>

            <section className="modern-meal-list">
                <h2>Daily Meal Structure</h2>
                {data.meals.map((meal) => (
                    <div key={meal.name}>
                        <span>{meal.name}</span>
                        <strong>{meal.items.join(" · ")}</strong>
                    </div>
                ))}
            </section>
            <Footer data={data} />
        </article>
    );
}

const templateMap = {
    "clinical-classic": ClinicalClassic,
    "green-minimal": GreenMinimal,
    "structured-chart": StructuredChart,
    "executive-summary": ExecutiveSummary,
    "modern-blue": ModernBlue,
};

export default function PdfPreview() {
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
    const ActiveTemplate = useMemo(() => templateMap[selectedTemplate], [selectedTemplate]);
    const scrollDown = () => {
        window.scrollBy({ top: Math.round(window.innerHeight * 0.82), behavior: "smooth" });
    };

    return (
        <main className="pdf-preview-page">
            <div className="pdf-preview-toolbar">
                <div>
                    <h1>Clinical PDF Template Preview</h1>
                    <p>Preview-only A4 layouts using one shared sample data set.</p>
                </div>
                <label>
                    Template
                    <select value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value)}>
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                    </select>
                </label>
                <button type="button" className="pdf-toolbar-scroll" onClick={scrollDown}>
                    Scroll down
                </button>
            </div>
            <button type="button" className="pdf-scroll-button" onClick={scrollDown}>
                Scroll down
            </button>
            <div className="pdf-preview-stage">
                <ActiveTemplate data={sampleData} />
            </div>
        </main>
    );
}
