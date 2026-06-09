import { Link } from "react-router-dom";
import { Mail, Clock, Shield } from "lucide-react";
import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { LAST_UPDATED, SECURITY_EMAIL, SUPPORT_EMAIL } from "../constants/trust";

const CONTACT_CARDS = [
    {
        icon: Mail,
        title: "Product support",
        body: "Account access, verification email issues, patient workflows, exports, and general product questions.",
        email: SUPPORT_EMAIL,
        cta: "Email support",
    },
    {
        icon: Shield,
        title: "Security reports",
        body: "Suspected vulnerabilities, unauthorized access, or privacy incidents affecting DietDesk accounts.",
        email: SECURITY_EMAIL,
        cta: "Report a security issue",
    },
];

export default function ContactUs() {
    return (
        <PublicPageShell
            title="Contact Us"
            metaDescription="Contact DietDesk support for account help, product questions, and security reporting. Typical response within one business day."
            narrow
        >
            <TrustDocument
                title="Contact Us"
                subtitle="We're here to help dietitians get the most out of DietDesk and resolve account issues quickly."
            >
                <div className="contact-card-grid">
                    {CONTACT_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.title} className="contact-card">
                                <div className="contact-card-icon" aria-hidden="true">
                                    <Icon size={22} />
                                </div>
                                <h2>{card.title}</h2>
                                <p>{card.body}</p>
                                <a href={`mailto:${card.email}`} className="contact-card-link">
                                    {card.cta}
                                </a>
                                <p className="contact-card-email">{card.email}</p>
                            </div>
                        );
                    })}
                </div>

                <TrustSection title="Response times">
                    <div className="contact-highlight">
                        <Clock size={18} aria-hidden="true" />
                        <p>
                            We aim to respond to support requests within <strong>one business day</strong> (Monday–Friday).
                            Urgent security reports are prioritized. Complex clinical workflow questions may require
                            additional follow-up.
                        </p>
                    </div>
                </TrustSection>

                <TrustSection title="What to include in your message">
                    <ul>
                        <li>The email address associated with your DietDesk account</li>
                        <li>A clear description of the issue and when it occurred</li>
                        <li>Screenshots only if they help explain the problem (avoid unnecessary patient identifiers)</li>
                        <li>Browser and device type for technical issues</li>
                    </ul>
                    <p>
                        Please do not send full patient records or unnecessary sensitive health information by email
                        unless required to resolve a specific support case.
                    </p>
                </TrustSection>

                <TrustSection title="Common topics we can help with">
                    <ul>
                        <li>Email verification and account recovery</li>
                        <li>Login or session issues</li>
                        <li>Meal planning, calculations, and PDF export questions</li>
                        <li>Data access, export, or account deletion requests</li>
                        <li>Partnership and early-access inquiries</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Security and privacy">
                    <p>
                        For a detailed overview of how we protect data, visit our{" "}
                        <Link to="/security">Security page</Link>. Privacy-related questions are covered in our{" "}
                        <Link to="/privacy">Privacy Policy</Link>.
                    </p>
                </TrustSection>

                <TrustSection title="Business inquiries">
                    <p>
                        For collaborations, institutional pilots, or media requests, email{" "}
                        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the subject line
                        &quot;Business inquiry&quot; and a short overview of your organization.
                    </p>
                </TrustSection>

                <p className="trust-footnote">
                    Last updated {LAST_UPDATED}. Primary support inbox:{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                </p>
            </TrustDocument>
        </PublicPageShell>
    );
}
