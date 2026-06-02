import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, PlusCircle, Settings } from "lucide-react";

const navItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Create Plan", icon: PlusCircle, path: "/create-plan", highlight: true },
    { label: "Settings", icon: Settings, path: "/settings" },
];

function isActivePath(pathname, path) {
    if (path === "/create-plan") {
        return pathname === "/create-plan" || pathname === "/planner";
    }
    return pathname === path;
}

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="mobile-bottom-nav" aria-label="Main navigation">
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(location.pathname, item.path);

                return (
                    <button
                        key={item.path}
                        type="button"
                        className={[
                            "mobile-bottom-nav__item",
                            active ? "mobile-bottom-nav__item--active" : "",
                            item.highlight ? "mobile-bottom-nav__item--highlight" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => navigate(item.path)}
                        aria-current={active ? "page" : undefined}
                    >
                        <span className="mobile-bottom-nav__icon">
                            <Icon size={item.highlight ? 24 : 22} strokeWidth={active ? 2.5 : 2} fill={active && !item.highlight ? "currentColor" : "none"} />
                        </span>
                        <span className="mobile-bottom-nav__label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
