import { Link } from "react-router-dom";
import DietDeskLogo from "./DietDeskLogo";
import { SUPPORT_EMAIL } from "../constants/trust";
import "../landing.css";

const LEGAL_LINKS = [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/security", label: "Security" },
    { to: "/contact", label: "Contact Us" },
];

export default function PublicFooter() {
    return (
        <footer className="landing-footer public-footer">
            <div className="landing-container">
                <div className="landing-footer-grid public-footer-grid">
                    <div className="landing-footer-brand">
                        <Link to="/" className="landing-logo landing-footer-logo" aria-label="DietDesk home">
                            <DietDeskLogo compact idPrefix="footer" />
                        </Link>
                        <p className="landing-footer-tagline">
                            Clinical nutrition software for modern diet planning.
                        </p>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="public-footer-email">
                            {SUPPORT_EMAIL}
                        </a>
                    </div>
                    <nav className="landing-footer-col" aria-label="Product links">
                        <p className="landing-footer-col-title">Product</p>
                        <Link to="/#features" className="landing-footer-legal-link">
                            Features
                        </Link>
                        <Link to="/signup" className="landing-footer-legal-link">
                            Create account
                        </Link>
                        <Link to="/login" className="landing-footer-legal-link">
                            Sign in
                        </Link>
                    </nav>
                    <nav className="landing-footer-col" aria-label="Legal and trust links">
                        <p className="landing-footer-col-title">Legal &amp; Trust</p>
                        {LEGAL_LINKS.map((link) => (
                            <Link key={link.to} to={link.to} className="landing-footer-legal-link">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <p className="landing-footer-copy">
                    © {new Date().getFullYear()} DietDesk. All rights reserved.
                </p>
                <p className="landing-footer-disclaimer">
                    For educational and professional diet-planning support. Not a replacement for medical diagnosis or licensed clinical judgment.
                </p>
            </div>
        </footer>
    );
}
