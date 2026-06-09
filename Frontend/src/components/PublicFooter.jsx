import { Link } from "react-router-dom";
import "../landing.css";

const FOOTER_LINKS = [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/security", label: "Security" },
    { to: "/contact", label: "Contact Us" },
];

export default function PublicFooter() {
    return (
        <footer className="public-footer-simple">
            <div className="landing-container public-footer-simple-inner">
                <p className="public-footer-copy">© 2026 DietDesk</p>
                <nav className="public-footer-nav" aria-label="Legal and trust links">
                    {FOOTER_LINKS.map((link) => (
                        <Link key={link.to} to={link.to}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <p className="public-footer-tagline">Built for Nutrition Students and Dietitians</p>
            </div>
        </footer>
    );
}
