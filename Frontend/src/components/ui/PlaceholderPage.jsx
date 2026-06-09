import EmptyState from "./EmptyState";

export default function PlaceholderPage({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
}) {
    return (
        <div className="fade-up settings-page placeholder-page dd-mobile-page page-content" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div className="dd-card">
                <EmptyState
                    icon={Icon}
                    title={title}
                    description={description || "This section is being prepared to provide the best clinical experience."}
                    actionLabel={actionLabel}
                    onAction={onAction}
                />
                <div style={{ textAlign: "center", marginTop: "-0.5rem", paddingBottom: "1.5rem" }}>
                    <span className="coming-soon-pill">Coming Soon</span>
                </div>
            </div>
        </div>
    );
}
