import { Link } from "react-router-dom";
import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { SECURITY_EMAIL, SUPPORT_EMAIL } from "../constants/trust";

export default function SecurityPage() {
    return (
        <PublicPageShell
            title="Security"
            metaDescription="Review DietDesk security practices for authentication, encrypted data storage, access controls, and responsible vulnerability disclosure."
        >
            <TrustDocument
                title="Security at DietDesk"
                subtitle="How we protect dietitian accounts, patient workspaces, and clinical workflow data."
            >
                <TrustSection title="Our security commitment">
                    <p>
                        DietDesk is built for nutrition professionals who manage sensitive client information. Security
                        is integrated into our architecture, development process, and operational practices—not added as
                        an afterthought.
                    </p>
                    <p>
                        While no online platform can guarantee absolute security, we implement layered controls designed
                        to reduce risk and support trustworthy clinical workflows.
                    </p>
                </TrustSection>

                <TrustSection title="Infrastructure and encryption">
                    <ul>
                        <li><strong>Encryption in transit:</strong> All web traffic uses HTTPS/TLS between your browser and DietDesk services.</li>
                        <li><strong>Encrypted databases:</strong> Account and workspace data is stored with established cloud database providers using encryption at rest.</li>
                        <li><strong>Managed hosting:</strong> Application components run on reputable cloud infrastructure with monitored uptime and patching processes.</li>
                        <li><strong>Secrets management:</strong> API keys, database credentials, and signing secrets are stored as environment secrets—not in source code.</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Authentication and access control">
                    <ul>
                        <li>Passwords are hashed using industry-standard one-way algorithms; we do not store plaintext passwords.</li>
                        <li>Authenticated sessions use signed tokens with expiration to reduce long-lived exposure.</li>
                        <li>Patient records and plans are scoped to the authenticated account that created them.</li>
                        <li>Administrative access to production systems is limited to personnel with a legitimate operational need.</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Application security practices">
                    <ul>
                        <li>Input validation on API endpoints to reduce malformed or abusive requests</li>
                        <li>Structured logging for authentication, email delivery, and server errors to support rapid diagnosis</li>
                        <li>Cross-origin protections and production routing designed to reduce browser-level connection failures</li>
                        <li>Transactional email through verified sending domains to reduce spoofing and delivery failures</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Data isolation">
                    <p>
                        Each DietDesk account operates in a logically separated workspace. Patient profiles, meal plans,
                        clinical notes, and export history created under your account are not shared with other users
                        unless you explicitly export or share materials outside the platform.
                    </p>
                </TrustSection>

                <TrustSection title="Backups and availability">
                    <p>
                        We rely on our infrastructure providers&apos; backup and replication capabilities to protect against
                        accidental data loss. We monitor service health and investigate incidents that could affect data
                        integrity or availability.
                    </p>
                </TrustSection>

                <TrustSection title="Your role in security">
                    <p>You can strengthen security in your practice by:</p>
                    <ul>
                        <li>Using a strong, unique password for your DietDesk account</li>
                        <li>Signing out on shared or clinic workstations</li>
                        <li>Limiting patient identifiers in support emails when screenshots are not required</li>
                        <li>Reviewing exported PDFs before sharing them through external channels</li>
                        <li>Reporting suspicious account activity promptly</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Compliance posture">
                    <p>
                        DietDesk is designed to support professional nutrition workflows. We do not represent that using
                        DietDesk alone makes your practice HIPAA-compliant, GDPR-compliant, or compliant with any
                        specific regulatory framework. You are responsible for evaluating whether your use of the platform
                        meets obligations in your jurisdiction and clinical setting.
                    </p>
                    <p>
                        We are happy to discuss our data handling practices on request at{" "}
                        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                    </p>
                </TrustSection>

                <TrustSection title="Responsible disclosure">
                    <p>
                        If you believe you have discovered a security vulnerability in DietDesk, please report it to{" "}
                        <a href={`mailto:${SECURITY_EMAIL}`}>{SECURITY_EMAIL}</a>. Include a clear description,
                        reproduction steps, and potential impact. Please do not publicly disclose issues until we have
                        had a reasonable opportunity to investigate and remediate.
                    </p>
                    <p>We appreciate researchers and users who report issues responsibly.</p>
                </TrustSection>

                <TrustSection title="Incident response">
                    <p>
                        If we confirm a security incident affecting customer data, we will investigate promptly, take
                        containment steps, and notify affected users where required and appropriate. Contact{" "}
                        <a href={`mailto:${SECURITY_EMAIL}`}>{SECURITY_EMAIL}</a> for urgent security concerns.
                    </p>
                </TrustSection>

                <TrustSection title="Related policies">
                    <p>
                        Read our <Link to="/privacy">Privacy Policy</Link> for data collection and retention details, and
                        our <Link to="/terms">Terms of Service</Link> for acceptable use and account responsibilities.
                    </p>
                </TrustSection>
            </TrustDocument>
        </PublicPageShell>
    );
}
