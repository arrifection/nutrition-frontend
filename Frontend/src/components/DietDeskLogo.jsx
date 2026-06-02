import { HandHeart } from "lucide-react";

/**
 * DietDesk brand mark — caring hand + heart on emerald gradient.
 * Used on landing, login, signup, and footer.
 */
export default function DietDeskLogo({
    compact = false,
    idPrefix = "main",
    showText = true,
    light = false,
    className = "",
}) {
    const size = compact ? 34 : 40;
    const iconSize = compact ? 18 : 22;
    const gradId = `dd-brand-bg-${idPrefix}`;

    return (
        <span className={`dd-brand ${compact ? "dd-brand--compact" : ""} ${className}`.trim()}>
            <span className="dd-brand-icon" aria-hidden="true">
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
                    <defs>
                        <linearGradient id={gradId} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#059669" />
                            <stop offset="1" stopColor="#0f766e" />
                        </linearGradient>
                    </defs>
                </svg>
                <HandHeart
                    className="dd-brand-glyph"
                    size={iconSize}
                    color="white"
                    strokeWidth={2.1}
                />
            </span>
            {showText ? (
                <span className={`dd-brand-name landing-logo-text${light ? " dd-brand-name--light" : ""}`}>
                    DietDesk
                </span>
            ) : null}
        </span>
    );
}
