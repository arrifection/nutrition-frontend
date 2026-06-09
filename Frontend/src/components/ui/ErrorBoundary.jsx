import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { captureReactError } from "../../utils/sentry";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("DietDesk render error:", error, info);
        captureReactError(error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="app-error-fallback dd-api-error-state" style={{ minHeight: "100vh", border: "none", background: "var(--background)" }}>
                    <div className="dd-api-error-state__icon" aria-hidden>
                        <AlertTriangle size={48} />
                    </div>
                    <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
                    <p style={{ maxWidth: 420, margin: "0 auto 1.25rem", color: "var(--text-secondary)" }}>
                        DietDesk hit an unexpected error. You can try again without losing your session.
                    </p>
                    <div className="dd-empty-state__actions">
                        <button type="button" className="btn-primary" onClick={this.handleRetry}>
                            <RefreshCw size={16} style={{ marginRight: 6 }} />
                            Try again
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
