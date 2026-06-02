import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users,
    FileText,
    Calculator,
    UtensilsCrossed,
    Download,
    ClipboardList,
    CheckCircle2,
    ArrowRight,
    Star,
    FileCheck,
} from "lucide-react";
import DietDeskLogo from "../components/DietDeskLogo";
import "../landing.css";

const FINAL_TRUST_POINTS = [
    "No setup complexity",
    "Built for dietitians",
    "PDF-ready plans",
];

const PREVIEW_MEALS = [
    { meal: "Breakfast", items: "Oats, banana, almonds", kcal: "420" },
    { meal: "Lunch", items: "Grilled chicken, quinoa salad", kcal: "480" },
    { meal: "Dinner", items: "Fish, steamed vegetables", kcal: "390" },
];

const scrollToDemo = (e) => {
    e.preventDefault();
    document.getElementById("product-demo")?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const STATS = [
    { value: "500+", label: "Diet Plans Generated" },
    { value: "100+", label: "Patients Managed" },
    { value: "25+", label: "Early Testers" },
    { value: "4.9/5", label: "User Satisfaction" },
];

const FEATURES = [
    { icon: Users, title: "Patient Management", desc: "Organize clinical rosters, demographics, and notes in one secure workspace." },
    { icon: FileText, title: "Diet Plan Generator", desc: "Build structured weekly nutrition protocols tailored to each patient." },
    { icon: Calculator, title: "Calories & Macro Calculations", desc: "Automated BMI, BMR, TDEE, and macro targets from clinical inputs." },
    { icon: UtensilsCrossed, title: "Meal Planning", desc: "Assign foods across meals with exchange-list precision and daily totals." },
    { icon: Download, title: "PDF Export", desc: "Export polished, client-ready diet plans with professional templates." },
    { icon: ClipboardList, title: "Clinical Notes", desc: "Capture allergies, restrictions, and background for safer recommendations." },
];

const STEPS = [
    { num: "1", title: "Add patient details", desc: "Enter demographics, goals, activity level, and clinical background." },
    { num: "2", title: "Generate nutrition plan", desc: "Calculate needs, set macros, and build meals across the week." },
    { num: "3", title: "Review and export", desc: "Fine-tune the plan and download a professional PDF for your client." },
];

const WHY_ITEMS = [
    "Faster patient assessments",
    "Professional PDF diet plans",
    "Accurate calorie & macro calculations",
    "Easy patient management",
    "Modern cloud-based workflow",
];

const TESTIMONIALS = [
    {
        quote: "DietDesk saves me hours when creating professional meal plans.",
        role: "Clinical Nutrition Student",
    },
    {
        quote: "Patient management and plan generation are incredibly simple.",
        role: "Freelance Dietitian",
    },
    {
        quote: "The PDF exports look professional and ready for clients.",
        role: "Wellness Consultant",
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.2, 1, 0.4, 1] },
    }),
};

export default function Landing() {
    return (
        <div className="landing-page">
            {/* ── Nav ── */}
            <header className="landing-nav">
                <div className="landing-container landing-nav-inner">
                    <Link to="/" className="landing-logo" aria-label="DietDesk home">
                        <DietDeskLogo idPrefix="header" />
                    </Link>
                    <nav className="landing-nav-links" aria-label="Account actions">
                        <Link to="/login" className="landing-nav-login">
                            Login
                        </Link>
                        <Link to="/signup" className="landing-btn landing-btn-primary landing-btn-nav-cta">
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="landing-hero">
                <div className="landing-container">
                    <div className="landing-hero-grid">
                        <div className="landing-hero-copy">
                            <motion.div
                                className="landing-hero-badge"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                            >
                                Built for dietitians, nutrition students & clinics
                            </motion.div>

                            <motion.h1
                                className="landing-hero-title"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.05 }}
                            >
                                Create client-ready diet plans in minutes
                            </motion.h1>

                            <motion.p
                                className="landing-hero-sub"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.12 }}
                            >
                                Manage patients, calculate needs, generate meal plans, and export polished PDF diet plans from one clinical workspace.
                            </motion.p>

                            <motion.div
                                className="landing-hero-cta landing-hero-cta-split"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Link to="/signup" className="landing-btn landing-btn-primary landing-btn-lg">
                                    Get Started
                                    <ArrowRight size={18} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={scrollToDemo}
                                    className="landing-btn landing-btn-outline landing-btn-lg"
                                >
                                    View Demo
                                </button>
                            </motion.div>

                        </div>

                        <motion.div
                            id="product-demo"
                            className="landing-hero-preview"
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15, ease: [0.2, 1, 0.4, 1] }}
                        >
                            <div className="landing-preview-glow" aria-hidden="true" />
                            <div className="landing-preview-card">
                                <div className="landing-preview-topbar">
                                    <span className="landing-preview-dot" />
                                    <span className="landing-preview-dot" />
                                    <span className="landing-preview-dot" />
                                    <span className="landing-preview-topbar-label">Plan Preview</span>
                                </div>
                                <div className="landing-preview-body">
                                    <div className="landing-preview-header-row">
                                        <div>
                                            <p className="landing-preview-label">Patient</p>
                                            <p className="landing-preview-patient">Sarah Ahmed</p>
                                        </div>
                                        <span className="landing-preview-pdf-badge">
                                            <FileCheck size={14} />
                                            PDF Ready
                                        </span>
                                    </div>
                                    <div className="landing-preview-metrics">
                                        <div className="landing-preview-metric">
                                            <span>Goal</span>
                                            <strong>Weight loss</strong>
                                        </div>
                                        <div className="landing-preview-metric">
                                            <span>Calories</span>
                                            <strong>1500 kcal</strong>
                                        </div>
                                        <div className="landing-preview-metric">
                                            <span>Protein</span>
                                            <strong>95g</strong>
                                        </div>
                                    </div>
                                    <div className="landing-preview-meals">
                                        <p className="landing-preview-meals-title">Today&apos;s meal plan</p>
                                        {PREVIEW_MEALS.map((row) => (
                                            <div key={row.meal} className="landing-preview-meal-row">
                                                <div>
                                                    <strong>{row.meal}</strong>
                                                    <span>{row.items}</span>
                                                </div>
                                                <em>{row.kcal} kcal</em>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Social proof stats ── */}
            <section className="landing-stats-section">
                <div className="landing-container">
                    <div className="landing-stats-grid">
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="landing-stat-card"
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-40px" }}
                                variants={fadeUp}
                            >
                                <div className="landing-stat-value">{stat.value}</div>
                                <div className="landing-stat-label">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="landing-section" id="features">
                <div className="landing-container">
                    <h2 className="landing-section-title">Everything you need for clinical nutrition</h2>
                    <p className="landing-section-sub">
                        A focused toolkit for dietitians who want speed without sacrificing professional quality.
                    </p>
                    <div className="landing-features-grid">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <motion.div
                                    key={f.title}
                                    className="landing-feature-card"
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-30px" }}
                                    variants={fadeUp}
                                >
                                    <div className="landing-feature-icon">
                                        <Icon size={22} strokeWidth={2.2} />
                                    </div>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="landing-section landing-section-alt">
                <div className="landing-container">
                    <h2 className="landing-section-title">How it works</h2>
                    <div className="landing-steps">
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={step.num}
                                className="landing-step-card"
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                            >
                                <div className="landing-step-num">{step.num}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why professionals choose ── */}
            <section className="landing-section">
                <div className="landing-container landing-why-grid">
                    <div className="landing-why-copy">
                        <h2 className="landing-section-title landing-section-title-left">
                            Why professionals choose DietDesk
                        </h2>
                        <p className="landing-section-sub landing-section-sub-left">
                            Designed for real clinical workflows — from first assessment to client-ready export.
                        </p>
                    </div>
                    <ul className="landing-why-list">
                        {WHY_ITEMS.map((item, i) => (
                            <motion.li
                                key={item}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                            >
                                <CheckCircle2 size={20} className="landing-why-check" />
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="landing-section landing-section-alt">
                <div className="landing-container">
                    <p className="landing-testimonials-kicker">What early users are saying</p>
                    <h2 className="landing-section-title">Reviews from nutrition professionals</h2>
                    <p className="landing-testimonials-disclaimer">
                        Individual experiences may vary.
                    </p>
                    <div className="landing-testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.blockquote
                                key={t.role}
                                className="landing-testimonial-card"
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                            >
                                <div className="landing-stars" aria-label="5 out of 5 stars">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <p>&ldquo;{t.quote}&rdquo;</p>
                                <footer>— {t.role}</footer>
                            </motion.blockquote>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trust banner ── */}
            <section className="landing-trust-banner">
                <div className="landing-container">
                    <p>Built by nutrition professionals for nutrition professionals.</p>
                </div>
            </section>

            {/* ── Trust + audience ── */}
            <section className="landing-section landing-trust-section">
                <div className="landing-container landing-trust-inner">
                    <h2 className="landing-section-title">Built for your practice</h2>
                    <p className="landing-trust-text">
                        Built for dietitians, nutrition students, clinics, and wellness professionals.
                    </p>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="landing-final-wrap landing-section-alt">
                <div className="landing-container">
                    <motion.div
                        className="landing-final-panel"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.55, ease: [0.2, 1, 0.4, 1] }}
                    >
                        <span className="landing-final-badge">Ready for your first client-ready plan?</span>
                        <h2 className="landing-final-title">Start building professional diet plans today</h2>
                        <p className="landing-final-sub">
                            Create your account, add a patient, and generate a polished PDF diet plan in minutes.
                        </p>

                        <div className="landing-final-actions">
                            <Link to="/signup" className="landing-btn landing-btn-primary landing-btn-lg">
                                Get Started Free
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="landing-btn landing-btn-outline landing-btn-lg">
                                Login
                            </Link>
                        </div>

                        <ul className="landing-final-trust">
                            {FINAL_TRUST_POINTS.map((point) => (
                                <li key={point}>
                                    <CheckCircle2 size={16} strokeWidth={2.5} />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="landing-container">
                    <div className="landing-footer-main">
                        <div className="landing-footer-brand">
                            <Link to="/" className="landing-logo landing-footer-logo" aria-label="DietDesk home">
                                <DietDeskLogo compact idPrefix="footer" />
                            </Link>
                            <p className="landing-footer-tagline">
                                Clinical nutrition software for modern diet planning.
                            </p>
                        </div>
                        <p className="landing-footer-copy">© 2026 DietDesk</p>
                        <nav className="landing-footer-links" aria-label="Footer navigation">
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign up</Link>
                        </nav>
                    </div>
                    <p className="landing-footer-disclaimer">
                        For educational and professional diet-planning support. Not a replacement for medical diagnosis.
                    </p>
                </div>
            </footer>
        </div>
    );
}
