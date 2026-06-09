import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    Calculator,
    ChevronDown,
    ClipboardList,
    Download,
    FileText,
    GraduationCap,
    HeartPulse,
    Shield,
    Sparkles,
    Stethoscope,
    Users,
    UtensilsCrossed,
    Building2,
} from "lucide-react";
import DietDeskLogo from "../components/DietDeskLogo";
import PublicFooter from "../components/PublicFooter";
import PageMeta from "../components/PageMeta";
import "../landing-home.css";

const ROUTES = { signup: "/signup", login: "/login", home: "/" };

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
    }),
};

const FEATURES = [
    {
        icon: Users,
        title: "Patient workspace",
        desc: "Centralize demographics, goals, allergies, and clinical notes in one organized profile.",
    },
    {
        icon: Calculator,
        title: "Clinical calculations",
        desc: "BMI, BMR, TDEE, and macro targets generated from evidence-based inputs in seconds.",
    },
    {
        icon: UtensilsCrossed,
        title: "Structured meal planning",
        desc: "Build daily and weekly plans with exchange-list precision and live nutrition totals.",
    },
    {
        icon: FileText,
        title: "Plan builder",
        desc: "Create repeatable diet protocols tailored to each patient’s goals and restrictions.",
    },
    {
        icon: Download,
        title: "Client-ready PDFs",
        desc: "Export polished diet plans your clients can understand — professional layout included.",
    },
    {
        icon: ClipboardList,
        title: "Reflection logs",
        desc: "Track adherence and progress notes to support follow-ups and plan adjustments.",
    },
];

const WHY_POINTS = [
    {
        title: "Built for real clinical pace",
        desc: "Spend less time formatting spreadsheets and more time with patients.",
    },
    {
        title: "Professional from day one",
        desc: "Outputs look credible enough to hand to clients without extra design work.",
    },
    {
        title: "Cloud workflow, zero install",
        desc: "Access plans from clinic, university, or home — always up to date.",
    },
    {
        title: "Security-minded by design",
        desc: "Encrypted connections, account isolation, and verification flows for peace of mind.",
    },
];

const AUDIENCES = [
    { icon: GraduationCap, title: "Nutrition students", desc: "Practice assessments and meal plans with a workflow that mirrors real clinics." },
    { icon: Stethoscope, title: "Registered dietitians", desc: "Manage caseloads, generate plans, and export PDFs in one professional workspace." },
    { icon: Building2, title: "Clinics & practices", desc: "Standardize how your team documents nutrition care across patients." },
    { icon: HeartPulse, title: "Wellness professionals", desc: "Deliver structured dietary guidance with clarity and consistency." },
];

const TESTIMONIALS = [
    {
        quote: "DietDesk cut my plan prep time dramatically. The PDF export alone is worth it.",
        name: "Saim",
        role: "Clinical nutrition student",
    },
    {
        quote: "Patient profiles and macro calculations in one place — exactly what I needed.",
        name: "Salwa",
        role: "Freelance dietitian",
    },
    {
        quote: "Clean, focused, and built for dietitians — not a generic health app.",
        name: "Sania",
        role: "Wellness consultant",
    },
];

const FAQS = [
    {
        q: "Who is DietDesk for?",
        a: "DietDesk is designed for nutrition students, registered dietitians, clinic teams, and wellness professionals who create structured dietary plans for clients.",
    },
    {
        q: "Is DietDesk a replacement for medical advice?",
        a: "No. DietDesk is a professional planning tool. You remain responsible for all clinical judgments, recommendations, and patient consent.",
    },
    {
        q: "Can I export plans for clients?",
        a: "Yes. Generate professional PDF diet plans directly from your completed meal plans and patient profiles.",
    },
    {
        q: "How do I verify my account?",
        a: "After signup, check your inbox for a verification email. You have a grace period to verify while you explore the platform.",
    },
    {
        q: "Is my patient data secure?",
        a: "We use industry-standard encryption in transit, secure authentication, and isolated workspaces. See our Security page for details.",
    },
];

function FaqItem({ question, answer, isOpen, onToggle }) {
    return (
        <div className={`home-faq-item ${isOpen ? "is-open" : ""}`}>
            <button type="button" className="home-faq-trigger" onClick={onToggle} aria-expanded={isOpen}>
                <span>{question}</span>
                <ChevronDown size={18} aria-hidden="true" />
            </button>
            {isOpen && <div className="home-faq-answer">{answer}</div>}
        </div>
    );
}

function ProductMock({ label, children, accent }) {
    return (
        <div className={`home-mock ${accent ? `home-mock--${accent}` : ""}`}>
            <div className="home-mock-chrome">
                <span className="home-mock-dot home-mock-dot--red" />
                <span className="home-mock-dot home-mock-dot--yellow" />
                <span className="home-mock-dot home-mock-dot--green" />
                <span className="home-mock-label">{label}</span>
            </div>
            <div className="home-mock-body">{children}</div>
        </div>
    );
}

export default function Landing() {
    const [openFaq, setOpenFaq] = useState(0);

    const scrollTo = (id) => (e) => {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="home-page">
            <PageMeta
                title={null}
                description="DietDesk — modern clinical nutrition software for dietitians and students. Patient management, meal planning, macro calculations, and PDF exports."
            />

            {/* Nav */}
            <header className="home-nav">
                <div className="home-container home-nav-inner">
                    <Link to={ROUTES.home} className="home-logo" aria-label="DietDesk home">
                        <DietDeskLogo idPrefix="home-nav" />
                    </Link>
                    <nav className="home-nav-links" aria-label="Primary">
                        <button type="button" className="home-nav-link" onClick={scrollTo("#product")}>Product</button>
                        <button type="button" className="home-nav-link" onClick={scrollTo("#features")}>Features</button>
                        <button type="button" className="home-nav-link" onClick={scrollTo("#faq")}>FAQ</button>
                        <Link to={ROUTES.login} className="home-nav-link">Sign in</Link>
                        <Link to={ROUTES.signup} className="home-btn home-btn-primary home-btn-sm">Start free</Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="home-hero">
                <div className="home-hero-bg" aria-hidden="true" />
                <div className="home-container home-hero-grid">
                    <motion.div
                        className="home-hero-copy"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                    >
                        <span className="home-eyebrow">
                            <Sparkles size={14} aria-hidden="true" />
                            Clinical nutrition software — now live
                        </span>
                        <h1 className="home-hero-title">
                            The modern workspace for{" "}
                            <span className="home-text-gradient">dietitian-grade</span>{" "}
                            meal planning
                        </h1>
                        <p className="home-hero-sub">
                            DietDesk helps nutrition professionals manage patients, calculate macros,
                            build structured meal plans, and export client-ready PDFs — without the
                            spreadsheet chaos.
                        </p>
                        <div className="home-hero-cta">
                            <Link to={ROUTES.signup} className="home-btn home-btn-primary home-btn-lg">
                                Start free
                                <ArrowRight size={18} />
                            </Link>
                            <button type="button" className="home-btn home-btn-secondary home-btn-lg" onClick={scrollTo("#product")}>
                                See the product
                            </button>
                        </div>
                        <div className="home-hero-trust">
                            <span><Shield size={14} /> Secure cloud workspace</span>
                            <span><BarChart3 size={14} /> Clinical calculations built-in</span>
                            <span><Download size={14} /> PDF export included</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="home-hero-visual"
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <ProductMock label="DietDesk — Patient dashboard">
                            <div className="home-ui-sidebar">
                                <div className="home-ui-sidebar-item home-ui-sidebar-item--active">Patients</div>
                                <div className="home-ui-sidebar-item">Meal plans</div>
                                <div className="home-ui-sidebar-item">Exchange list</div>
                            </div>
                            <div className="home-ui-main">
                                <div className="home-ui-header">
                                    <div>
                                        <p className="home-ui-kicker">Active patient</p>
                                        <h3>Sarah Ahmed</h3>
                                    </div>
                                    <span className="home-ui-pill">Weight loss</span>
                                </div>
                                <div className="home-ui-metrics">
                                    <div><span>Calories</span><strong>1,500</strong></div>
                                    <div><span>Protein</span><strong>95g</strong></div>
                                    <div><span>Carbs</span><strong>160g</strong></div>
                                    <div><span>Fat</span><strong>48g</strong></div>
                                </div>
                                <div className="home-ui-meals">
                                    {["Breakfast — oats & berries", "Lunch — grilled chicken bowl", "Dinner — fish & greens"].map((m) => (
                                        <div key={m} className="home-ui-meal-row">{m}</div>
                                    ))}
                                </div>
                            </div>
                        </ProductMock>
                    </motion.div>
                </div>
            </section>

            {/* Social proof strip */}
            <section className="home-strip">
                <div className="home-container home-strip-inner">
                    <p>Built for nutrition students and dietitians launching real-world practice workflows</p>
                    <div className="home-strip-stats">
                        <div><strong>500+</strong><span>Plans created</span></div>
                        <div><strong>100+</strong><span>Patients managed</span></div>
                        <div><strong>4.9/5</strong><span>Early feedback</span></div>
                    </div>
                </div>
            </section>

            {/* Product screenshots */}
            <section className="home-section" id="product">
                <div className="home-container">
                    <div className="home-section-head">
                        <p className="home-section-kicker">Product</p>
                        <h2>Everything you need — one focused workspace</h2>
                        <p className="home-section-sub">
                            From first assessment to client-ready export, DietDesk keeps your nutrition workflow
                            structured, fast, and professional.
                        </p>
                    </div>
                    <div className="home-product-grid">
                        <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <ProductMock label="Macro calculator" accent="calc">
                                <div className="home-mini-form">
                                    <div className="home-mini-field"><label>Age</label><span>32</span></div>
                                    <div className="home-mini-field"><label>Weight</label><span>68 kg</span></div>
                                    <div className="home-mini-field"><label>Activity</label><span>Moderate</span></div>
                                </div>
                                <div className="home-mini-results">
                                    <div><span>BMR</span><strong>1,412 kcal</strong></div>
                                    <div><span>TDEE</span><strong>1,870 kcal</strong></div>
                                    <div><span>Target</span><strong className="home-text-green">1,500 kcal</strong></div>
                                </div>
                            </ProductMock>
                            <p className="home-mock-caption">Evidence-based calculations without leaving the patient record.</p>
                        </motion.div>

                        <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <ProductMock label="Weekly meal planner" accent="planner">
                                <div className="home-planner-days">
                                    {["Mon", "Tue", "Wed", "Thu"].map((d, i) => (
                                        <div key={d} className={`home-planner-day ${i === 0 ? "is-active" : ""}`}>{d}</div>
                                    ))}
                                </div>
                                <div className="home-planner-slots">
                                    <div className="home-planner-slot"><span>Breakfast</span><strong>Oatmeal, whey, banana</strong></div>
                                    <div className="home-planner-slot"><span>Lunch</span><strong>Quinoa, chicken, salad</strong></div>
                                    <div className="home-planner-slot"><span>Dinner</span><strong>Salmon, vegetables</strong></div>
                                </div>
                            </ProductMock>
                            <p className="home-mock-caption">Structured meal planning with daily totals at a glance.</p>
                        </motion.div>

                        <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <ProductMock label="PDF export preview" accent="pdf">
                                <div className="home-pdf-doc">
                                    <div className="home-pdf-header">
                                        <FileText size={20} />
                                        <div>
                                            <strong>7-Day Nutrition Plan</strong>
                                            <span>Sarah Ahmed · DietDesk</span>
                                        </div>
                                    </div>
                                    <div className="home-pdf-lines">
                                        <div /><div /><div className="short" />
                                    </div>
                                    <span className="home-ui-pill home-ui-pill--pdf">Ready to download</span>
                                </div>
                            </ProductMock>
                            <p className="home-mock-caption">Professional PDFs you can share with clients immediately.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="home-section home-section--alt" id="features">
                <div className="home-container">
                    <div className="home-section-head home-section-head--center">
                        <p className="home-section-kicker">Features</p>
                        <h2>Clinical tools without the clutter</h2>
                        <p className="home-section-sub">
                            Purpose-built for nutrition workflows — not a generic notes app with a calorie counter bolted on.
                        </p>
                    </div>
                    <div className="home-features-grid">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <motion.article
                                    key={f.title}
                                    className="home-feature-card"
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-40px" }}
                                    variants={fadeUp}
                                >
                                    <div className="home-feature-icon"><Icon size={20} /></div>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why DietDesk */}
            <section className="home-section" id="why">
                <div className="home-container home-why-grid">
                    <div className="home-section-head home-section-head--left">
                        <p className="home-section-kicker">Why DietDesk</p>
                        <h2>Less admin. More nutrition care.</h2>
                        <p className="home-section-sub">
                            Generic tools force dietitians to hack together spreadsheets, docs, and calculators.
                            DietDesk unifies the workflow so you can move from assessment to plan to PDF in one session.
                        </p>
                        <Link to={ROUTES.signup} className="home-btn home-btn-primary">
                            Create your free account
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="home-why-cards">
                        {WHY_POINTS.map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="home-why-card"
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                            >
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built for Dietitians */}
            <section className="home-section home-section--alt" id="audience">
                <div className="home-container">
                    <div className="home-section-head home-section-head--center">
                        <p className="home-section-kicker">Built for dietitians</p>
                        <h2>Designed for the people who actually write the plans</h2>
                        <p className="home-section-sub">
                            Whether you are in training or running a full caseload, DietDesk adapts to how nutrition professionals work.
                        </p>
                    </div>
                    <div className="home-audience-grid">
                        {AUDIENCES.map((a, i) => {
                            const Icon = a.icon;
                            return (
                                <motion.article
                                    key={a.title}
                                    className="home-audience-card"
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                >
                                    <div className="home-audience-icon"><Icon size={22} /></div>
                                    <h3>{a.title}</h3>
                                    <p>{a.desc}</p>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials placeholder */}
            <section className="home-section" id="testimonials">
                <div className="home-container">
                    <div className="home-section-head home-section-head--center">
                        <p className="home-section-kicker">Early feedback</p>
                        <h2>What nutrition professionals are saying</h2>
                        <p className="home-section-sub home-testimonial-note">
                            Feedback from early users helping shape DietDesk.
                        </p>
                    </div>
                    <div className="home-testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.blockquote
                                key={t.role}
                                className="home-testimonial-card"
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                            >
                                <p>&ldquo;{t.quote}&rdquo;</p>
                                <footer>
                                    <strong>{t.name}</strong>
                                    <span>{t.role}</span>
                                </footer>
                            </motion.blockquote>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="home-section home-section--alt" id="faq">
                <div className="home-container home-faq-layout">
                    <div className="home-section-head home-section-head--left">
                        <p className="home-section-kicker">FAQ</p>
                        <h2>Questions before you start?</h2>
                        <p className="home-section-sub">
                            Everything you need to know about getting started with DietDesk.
                        </p>
                        <Link to="/contact" className="home-link-arrow">
                            Contact support <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="home-faq-list">
                        {FAQS.map((item, i) => (
                            <FaqItem
                                key={item.q}
                                question={item.q}
                                answer={item.a}
                                isOpen={openFaq === i}
                                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="home-cta">
                <div className="home-container home-cta-inner">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="home-section-kicker home-section-kicker--light">Get started</p>
                        <h2>Launch your next client plan in minutes</h2>
                        <p>
                            Create your account, add your first patient, and generate a professional nutrition plan today.
                            No credit card required.
                        </p>
                        <div className="home-cta-actions">
                            <Link to={ROUTES.signup} className="home-btn home-btn-light home-btn-lg">
                                Start free
                                <ArrowRight size={18} />
                            </Link>
                            <Link to={ROUTES.login} className="home-btn home-btn-ghost-light home-btn-lg">
                                Sign in
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
