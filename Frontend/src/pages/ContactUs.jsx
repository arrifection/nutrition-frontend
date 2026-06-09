import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { FEEDBACK_EMAIL, SECURITY_EMAIL, SUPPORT_EMAIL } from "../constants/trust";

const CONTACT_ROWS = [
    { label: "General Support", email: SUPPORT_EMAIL },
    { label: "Technical Issues", email: SUPPORT_EMAIL },
    { label: "Security Reports", email: SECURITY_EMAIL },
    { label: "Feature Requests", email: FEEDBACK_EMAIL },
];

export default function ContactUs() {
    return (
        <PublicPageShell
            title="Contact Us"
            metaDescription="Contact DietDesk for support, technical help, security reports, and feature requests. We typically respond within 24–48 business hours."
            narrow
        >
            <TrustDocument
                title="Contact Us"
                subtitle="We would love to hear from you."
            >
                <div className="contact-simple-list">
                    {CONTACT_ROWS.map((row) => (
                        <div key={row.label} className="contact-simple-row">
                            <span className="contact-simple-label">{row.label}</span>
                            <a href={`mailto:${row.email}`} className="contact-simple-email">
                                {row.email}
                            </a>
                        </div>
                    ))}
                </div>

                <TrustSection title="Response Time">
                    <p>We typically respond within 24–48 business hours.</p>
                </TrustSection>

                <p className="trust-thanks">Thank you for helping us improve DietDesk.</p>
            </TrustDocument>
        </PublicPageShell>
    );
}
