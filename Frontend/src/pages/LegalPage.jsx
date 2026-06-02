import { Link } from "react-router-dom";
import DietDeskLogo from "../components/DietDeskLogo";
import "../landing.css";

export default function LegalPage({ title, description }) {
    return (
        <div className="landing-page legal-page">
            <header className="landing-nav">
                <div className="landing-container landing-nav-inner">
                    <Link to="/" className="landing-logo" aria-label="DietDesk home">
                        <DietDeskLogo idPrefix="legal" />
                    </Link>
                    <Link to="/" className="landing-nav-login">
                        Back to home
                    </Link>
                </div>
            </header>

            <main className="legal-page-main">
                <div className="landing-container">
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </main>
        </div>
    );
}
