import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { LEGAL_CONTACT_EMAIL } from "../constants/trust";

export default function PrivacyPolicy() {
    return (
        <PublicPageShell
            title="Privacy Policy"
            metaDescription="DietDesk Privacy Policy — how we collect, use, and protect account and patient information for nutrition professionals."
        >
            <TrustDocument title="Privacy Policy">
                <TrustSection title="Welcome to DietDesk">
                    <p>
                        DietDesk is a nutrition planning platform designed to assist nutrition students,
                        dietitians, and healthcare professionals in creating and managing dietary plans.
                    </p>
                </TrustSection>

                <TrustSection title="Information We Collect">
                    <p>We may collect:</p>
                    <ul>
                        <li>Name</li>
                        <li>Email address</li>
                        <li>Account information</li>
                        <li>Patient information entered by users</li>
                        <li>Dietary assessments</li>
                        <li>Nutrition plans</li>
                        <li>Usage analytics</li>
                    </ul>
                </TrustSection>

                <TrustSection title="How We Use Information">
                    <p>We use collected information to:</p>
                    <ul>
                        <li>Provide DietDesk services</li>
                        <li>Generate nutrition plans</li>
                        <li>Improve platform functionality</li>
                        <li>Provide customer support</li>
                        <li>Maintain account security</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Data Security">
                    <p>
                        We use industry-standard security measures to protect user information. While we strive
                        to protect your data, no internet transmission method is 100% secure.
                    </p>
                </TrustSection>

                <TrustSection title="Patient Data">
                    <p>
                        Users are responsible for ensuring they have appropriate consent before entering patient
                        information into DietDesk.
                    </p>
                </TrustSection>

                <TrustSection title="Data Sharing">
                    <p>DietDesk does not sell personal information to third parties.</p>
                </TrustSection>

                <TrustSection title="Account Deletion">
                    <p>Users may request account deletion by contacting support.</p>
                </TrustSection>

                <TrustSection title="Changes">
                    <p>
                        This policy may be updated periodically. Continued use of DietDesk constitutes acceptance
                        of updated policies.
                    </p>
                </TrustSection>

                <TrustSection title="Contact">
                    <p>
                        Email: <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
                    </p>
                </TrustSection>
            </TrustDocument>
        </PublicPageShell>
    );
}
