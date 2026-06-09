import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { SUPPORT_EMAIL } from "../constants/trust";

export default function PrivacyPolicy() {
    return (
        <PublicPageShell
            title="Privacy Policy"
            metaDescription="Learn how DietDesk collects, uses, and protects dietitian account data, patient records, and clinical workflow information."
        >
            <TrustDocument
                title="Privacy Policy"
                subtitle="How DietDesk handles personal information, patient data, and account activity for nutrition professionals."
            >
                <TrustSection title="1. Introduction">
                    <p>
                        DietDesk (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides cloud-based nutrition
                        planning software for licensed dietitians and qualified nutrition professionals. This Privacy
                        Policy explains what information we collect, why we collect it, how we use and protect it, and
                        the choices available to you.
                    </p>
                    <p>
                        By creating an account or using DietDesk, you agree to the practices described in this policy.
                        If you do not agree, please do not use the service.
                    </p>
                </TrustSection>

                <TrustSection title="2. Information we collect">
                    <p><strong>Account information.</strong> When you register, we collect your name or username, email address, password (stored in hashed form), and role.</p>
                    <p><strong>Patient and clinical workflow data.</strong> You may enter patient demographics, anthropometrics, goals, allergies, dietary restrictions, medical notes, meal plans, macro targets, reflection logs, and exported plan metadata. You control what clinical information is stored in your workspace.</p>
                    <p><strong>Usage and technical data.</strong> We collect standard application logs such as request timestamps, error events, browser type, IP address, and pages accessed to maintain security, diagnose issues, and improve reliability.</p>
                    <p><strong>Communications.</strong> If you contact support or request email verification, we process the content of those messages and your email address.</p>
                </TrustSection>

                <TrustSection title="3. How we use information">
                    <ul>
                        <li>Provide, operate, and secure your DietDesk account</li>
                        <li>Store and display patient records and diet plans you create</li>
                        <li>Send transactional emails such as verification and account notices</li>
                        <li>Monitor performance, prevent abuse, and troubleshoot errors</li>
                        <li>Respond to support requests and product inquiries</li>
                        <li>Improve features, usability, and platform stability</li>
                    </ul>
                    <p>We do not sell your personal information or patient data to third-party marketers.</p>
                </TrustSection>

                <TrustSection title="4. Your responsibilities for patient data">
                    <p>
                        DietDesk is a professional tool. You are responsible for obtaining appropriate consent,
                        maintaining accurate records, and using patient information in accordance with your professional
                        obligations and applicable privacy laws in your jurisdiction. Only enter information you are
                        authorized to process for nutrition care or practice management.
                    </p>
                </TrustSection>

                <TrustSection title="5. How we store and protect data">
                    <p>
                        Account and clinical data are stored in encrypted databases hosted with reputable cloud
                        infrastructure providers. Passwords are hashed using industry-standard algorithms. Access to
                        production systems is restricted to authorized personnel with a legitimate operational need.
                    </p>
                    <p>
                        We use transport encryption (HTTPS/TLS) for data in transit. No method of storage or
                        transmission is completely secure; we continuously work to reduce risk through monitoring,
                        access controls, and secure development practices.
                    </p>
                </TrustSection>

                <TrustSection title="6. Service providers">
                    <p>We rely on trusted subprocessors to operate DietDesk, including providers for:</p>
                    <ul>
                        <li>Application hosting and deployment</li>
                        <li>Database storage</li>
                        <li>Transactional email delivery</li>
                        <li>Frontend hosting and content delivery</li>
                    </ul>
                    <p>
                        These providers process data only to deliver the service on our behalf and are expected to
                        maintain appropriate security and confidentiality obligations.
                    </p>
                </TrustSection>

                <TrustSection title="7. Data retention">
                    <p>
                        We retain account and workspace data while your account remains active. If you request account
                        deletion or close your account, we will delete or anonymize associated data within a reasonable
                        period, except where retention is required for security, legal compliance, or dispute resolution.
                    </p>
                </TrustSection>

                <TrustSection title="8. Your rights and choices">
                    <p>Depending on your location, you may have rights to:</p>
                    <ul>
                        <li>Access or export information associated with your account</li>
                        <li>Correct inaccurate account details</li>
                        <li>Request deletion of your account</li>
                        <li>Object to or restrict certain processing activities</li>
                    </ul>
                    <p>
                        To exercise these rights, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We may
                        need to verify your identity before fulfilling a request.
                    </p>
                </TrustSection>

                <TrustSection title="9. International users">
                    <p>
                        DietDesk may be accessed from multiple countries. If you use the service outside your home
                        jurisdiction, your information may be processed in locations where our infrastructure providers
                        operate. We take steps designed to protect information regardless of where it is processed.
                    </p>
                </TrustSection>

                <TrustSection title="10. Children&apos;s privacy">
                    <p>
                        DietDesk is intended for professional use by adults. We do not knowingly collect personal
                        information directly from children under 16. Patient records for minors should only be entered by
                        authorized professionals with appropriate consent.
                    </p>
                </TrustSection>

                <TrustSection title="11. Changes to this policy">
                    <p>
                        We may update this Privacy Policy from time to time. Material changes will be reflected by
                        updating the &quot;Last updated&quot; date at the top of this page. Continued use of DietDesk
                        after changes become effective constitutes acceptance of the revised policy.
                    </p>
                </TrustSection>

                <TrustSection title="12. Contact us">
                    <p>
                        Questions about this Privacy Policy or our data practices can be sent to{" "}
                        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                    </p>
                </TrustSection>
            </TrustDocument>
        </PublicPageShell>
    );
}
