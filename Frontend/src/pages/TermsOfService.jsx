import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { SUPPORT_EMAIL } from "../constants/trust";

export default function TermsOfService() {
    return (
        <PublicPageShell
            title="Terms of Service"
            metaDescription="Read the DietDesk Terms of Service governing account use, clinical workflows, patient data, and professional nutrition software access."
        >
            <TrustDocument
                title="Terms of Service"
                subtitle="The agreement between you and DietDesk for use of our clinical nutrition platform."
            >
                <TrustSection title="1. Acceptance of terms">
                    <p>
                        These Terms of Service (&quot;Terms&quot;) govern access to and use of the DietDesk website,
                        applications, and related services (collectively, the &quot;Service&quot;). By registering for
                        an account or using the Service, you agree to these Terms and our Privacy Policy.
                    </p>
                </TrustSection>

                <TrustSection title="2. Who may use DietDesk">
                    <p>
                        DietDesk is designed for qualified nutrition professionals, including registered dietitians,
                        nutritionists, and supervised students or assistants working under professional guidance. You must
                        be at least 18 years old and capable of entering a binding agreement in your jurisdiction.
                    </p>
                    <p>You agree that registration information you provide is accurate and kept up to date.</p>
                </TrustSection>

                <TrustSection title="3. Account security">
                    <p>
                        You are responsible for safeguarding your login credentials and for all activity under your
                        account. Notify us promptly at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if you
                        suspect unauthorized access. We may suspend accounts that appear compromised or abusive.
                    </p>
                </TrustSection>

                <TrustSection title="4. Professional and clinical disclaimer">
                    <p>
                        DietDesk supports diet planning workflows, calculations, documentation, and exports. It does not
                        provide medical diagnosis, prescribe treatment, or replace independent professional judgment.
                    </p>
                    <p>
                        You remain solely responsible for clinical recommendations, patient interactions, and compliance
                        with laws, ethics codes, and scope-of-practice rules applicable to your profession.
                    </p>
                </TrustSection>

                <TrustSection title="5. Patient data and your obligations">
                    <p>When you enter patient information into DietDesk, you represent that:</p>
                    <ul>
                        <li>You have a lawful basis to collect and process that information</li>
                        <li>You will use the Service in accordance with applicable privacy and healthcare regulations</li>
                        <li>You will not upload unlawful, deceptive, or unnecessarily sensitive content</li>
                        <li>You will maintain appropriate confidentiality safeguards in your practice</li>
                    </ul>
                    <p>
                        DietDesk acts as a technology platform. You retain ownership of the professional content and
                        patient records you create, subject to our limited license to host and process that content to
                        operate the Service.
                    </p>
                </TrustSection>

                <TrustSection title="6. Acceptable use">
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Service for unlawful, fraudulent, or harmful purposes</li>
                        <li>Attempt to breach security, probe vulnerabilities without authorization, or disrupt systems</li>
                        <li>Reverse engineer, scrape, or resell the Service except as expressly permitted</li>
                        <li>Upload malware, spam, or content that infringes intellectual property rights</li>
                        <li>Misrepresent your professional credentials or identity</li>
                    </ul>
                </TrustSection>

                <TrustSection title="7. Intellectual property">
                    <p>
                        DietDesk and its branding, software, templates, and documentation are owned by us or our
                        licensors. We grant you a limited, non-exclusive, non-transferable license to use the Service
                        for your professional practice while your account remains in good standing.
                    </p>
                    <p>
                        You may export plans and reports you create for legitimate client use. You may not remove
                        proprietary notices or reproduce the underlying software for competing products.
                    </p>
                </TrustSection>

                <TrustSection title="8. Service availability and changes">
                    <p>
                        We strive for reliable uptime but do not guarantee uninterrupted access. Maintenance, updates,
                        third-party outages, or events outside our reasonable control may cause temporary disruption.
                        We may modify features, pricing, or availability with reasonable notice where practicable.
                    </p>
                </TrustSection>

                <TrustSection title="9. Fees">
                    <p>
                        Certain features may be offered free during early access or promotional periods. If paid plans are
                        introduced, pricing and billing terms will be presented before charges apply. Continued use of a
                        paid plan constitutes acceptance of the published pricing for that plan.
                    </p>
                </TrustSection>

                <TrustSection title="10. Termination">
                    <p>
                        You may stop using the Service at any time. We may suspend or terminate access if you violate
                        these Terms, create security risk, or use the platform in a manner that could harm other users or
                        the Service. Upon termination, your right to access the Service ends, though some provisions
                        reasonably intended to survive will remain in effect.
                    </p>
                </TrustSection>

                <TrustSection title="11. Disclaimer of warranties">
                    <p>
                        The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis to the maximum
                        extent permitted by law. We disclaim warranties of merchantability, fitness for a particular
                        purpose, and non-infringement. Calculations and templates are aids only and should be reviewed by
                        a qualified professional before clinical use.
                    </p>
                </TrustSection>

                <TrustSection title="12. Limitation of liability">
                    <p>
                        To the fullest extent permitted by law, DietDesk and its operators will not be liable for
                        indirect, incidental, special, consequential, or punitive damages, or for loss of profits,
                        data, goodwill, or business interruption arising from your use of the Service. Our aggregate
                        liability for any claim relating to the Service will not exceed the greater of amounts you paid
                        us in the twelve months before the claim or one hundred U.S. dollars (USD $100), except where
                        liability cannot be limited by applicable law.
                    </p>
                </TrustSection>

                <TrustSection title="13. Indemnification">
                    <p>
                        You agree to defend and indemnify DietDesk against claims arising from your misuse of the
                        Service, your patient data practices, your violation of these Terms, or your violation of
                        third-party rights, except to the extent caused by our gross negligence or willful misconduct.
                    </p>
                </TrustSection>

                <TrustSection title="14. Governing law">
                    <p>
                        These Terms are governed by the laws applicable in the jurisdiction where DietDesk operates its
                        primary business, without regard to conflict-of-law principles. Disputes should first be raised
                        with <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> so we can attempt good-faith
                        resolution.
                    </p>
                </TrustSection>

                <TrustSection title="15. Contact">
                    <p>
                        Questions about these Terms may be sent to{" "}
                        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                    </p>
                </TrustSection>
            </TrustDocument>
        </PublicPageShell>
    );
}
