import { LAST_UPDATED, LEGAL_CONTACT_EMAIL } from "../constants/trust";

export function TrustSection({ title, children }) {
    return (
        <section className="trust-section">
            <h2>{title}</h2>
            {children}
        </section>
    );
}

export default function TrustDocument({ title, subtitle, children, showContact = false }) {
    return (
        <article className="trust-document">
            <header className="trust-document-header">
                <h1>{title}</h1>
                <p className="trust-meta">
                    Last Updated: <time dateTime="2026-06">{LAST_UPDATED}</time>
                </p>
                {subtitle && <p className="trust-lead">{subtitle}</p>}
                {showContact && (
                    <p className="trust-meta">
                        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
                    </p>
                )}
            </header>
            <div className="trust-document-body">{children}</div>
        </article>
    );
}
