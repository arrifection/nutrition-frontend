import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

export default function ApiErrorState({
    title = "Couldn't load this section",
    message = "Something went wrong while fetching data. Please try again.",
    onRetry,
    offline = false,
}) {
    return (
        <div className="dd-api-error-state">
            <div className="dd-api-error-state__icon" aria-hidden>
                {offline ? <WifiOff size={40} /> : <AlertCircle size={40} />}
            </div>
            <h3>{offline ? "You're offline" : title}</h3>
            <p>{offline ? "Check your internet connection and try again." : message}</p>
            {onRetry && (
                <button type="button" className="btn-primary" onClick={onRetry}>
                    <RefreshCw size={16} style={{ marginRight: 6 }} />
                    Try again
                </button>
            )}
        </div>
    );
}
