import { WifiOff } from "lucide-react";

export default function OfflineBanner({ visible }) {
    if (!visible) return null;

    return (
        <div className="dd-offline-banner" role="status">
            <WifiOff size={16} aria-hidden />
            <span>You are offline. Changes will not save until your connection returns.</span>
        </div>
    );
}
