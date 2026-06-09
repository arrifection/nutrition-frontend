import { Link } from "react-router-dom";
import DietDeskLogo from "../components/DietDeskLogo";
import PageMeta from "../components/PageMeta";
import PublicFooter from "../components/PublicFooter";

export default function NotFound() {
    return (
        <div className="public-auth-layout min-h-screen bg-slate-50 flex flex-col">
            <PageMeta
                title="Page Not Found"
                description="The page you requested could not be found on DietDesk."
            />
            <div className="not-found-page flex-1">
                <Link to="/" className="not-found-logo" aria-label="DietDesk home">
                    <DietDeskLogo idPrefix="not-found" />
                </Link>
                <h1>404 — Page not found</h1>
                <p>The page you are looking for does not exist or has been moved.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn-primary">
                        Back to home
                    </Link>
                    <Link to="/login" className="btn-secondary">
                        Log in
                    </Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
