import { LAST_UPDATED, SUPPORT_EMAIL } from "../constants/trust";

export function TrustSection({ title, children }) {
    return (
        <section className="trust-section">
            <h2>{title}</h2>
            {children}
        </section>
    );
}

export default function TrustDocument({ title, subtitle, children }) {
    return (
        <article className="trust-document">
            <header className="trust-document-header">
                <p className="trust-eyebrow">DietDesk</p>
                <h1>{title}</h1>
                {subtitle && <p className="trust-lead">{subtitle}</p>}
                <p className="trust-meta">
                    Last updated: <time dateTime="2026-06-09">{LAST_UPDATED}</time>
                    {" · "}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                </p>
            </header>
            <div className="trust-document-body">{children}</div>
        </article>
    );
}
