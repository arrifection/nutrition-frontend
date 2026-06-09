export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    secondaryLabel,
    onSecondary,
    className = "",
}) {
    return (
        <div className={`dd-empty-state ${className}`.trim()}>
            {Icon && (
                <div className="dd-empty-state__icon" aria-hidden>
                    <Icon size={48} strokeWidth={1.5} />
                </div>
            )}
            <h3 className="dd-empty-state__title">{title}</h3>
            {description && <p className="dd-empty-state__description">{description}</p>}
            <div className="dd-empty-state__actions">
                {actionLabel && onAction && (
                    <button type="button" className="btn-primary" onClick={onAction}>
                        {actionLabel}
                    </button>
                )}
                {secondaryLabel && onSecondary && (
                    <button type="button" className="btn-secondary" onClick={onSecondary}>
                        {secondaryLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
