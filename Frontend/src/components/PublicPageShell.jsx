import { Link } from "react-router-dom";
import DietDeskLogo from "./DietDeskLogo";
import PageMeta from "./PageMeta";
import PublicFooter from "./PublicFooter";
import "../landing.css";

export default function PublicPageShell({
    title,
    metaTitle,
    metaDescription,
    children,
    narrow = false,
}) {
    return (
        <div className="landing-page public-page">
            <PageMeta title={metaTitle || title} description={metaDescription} />
            <header className="landing-nav">
                <div className="landing-container landing-nav-inner">
                    <Link to="/" className="landing-logo" aria-label="DietDesk home">
                        <DietDeskLogo idPrefix="public" />
                    </Link>
                    <div className="public-nav-actions">
                        <Link to="/login" className="landing-nav-login">
                            Sign in
                        </Link>
                        <Link to="/signup" className="landing-btn landing-btn-primary landing-btn-nav-cta">
                            Get started
                        </Link>
                    </div>
                </div>
            </header>

            <main className={`trust-page-main ${narrow ? "trust-page-main--narrow" : ""}`}>
                <div className="landing-container">
                    {children}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
