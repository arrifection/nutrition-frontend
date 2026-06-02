import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("DietDesk render error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="app-error-fallback">
                    <h1>Something went wrong</h1>
                    <p>DietDesk could not load. Please refresh the page or try again later.</p>
                    <button type="button" onClick={() => window.location.reload()}>
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
