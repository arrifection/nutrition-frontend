import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";
import { LEGAL_CONTACT_EMAIL } from "../constants/trust";

export default function TermsOfService() {
    return (
        <PublicPageShell
            title="Terms of Service"
            metaDescription="DietDesk Terms of Service — rules for using our nutrition planning platform as a student or dietitian."
        >
            <TrustDocument title="Terms of Service">
                <TrustSection title="Agreement">
                    <p>By using DietDesk, you agree to these terms.</p>
                </TrustSection>

                <TrustSection title="Use of Service">
                    <p>
                        DietDesk is provided as a tool to assist nutrition professionals and students.
                    </p>
                </TrustSection>

                <TrustSection title="Professional Responsibility">
                    <p>
                        DietDesk does not replace professional judgment. Users remain solely responsible for all
                        dietary recommendations, assessments, and healthcare decisions.
                    </p>
                </TrustSection>

                <TrustSection title="Accuracy">
                    <p>
                        While we strive for accuracy, DietDesk makes no guarantees regarding nutritional
                        calculations or recommendations.
                    </p>
                </TrustSection>

                <TrustSection title="User Accounts">
                    <p>Users are responsible for maintaining the confidentiality of their accounts.</p>
                </TrustSection>

                <TrustSection title="Prohibited Activities">
                    <p>Users may not:</p>
                    <ul>
                        <li>Attempt unauthorized access</li>
                        <li>Distribute malicious software</li>
                        <li>Misuse the platform</li>
                        <li>Violate applicable laws</li>
                    </ul>
                </TrustSection>

                <TrustSection title="Limitation of Liability">
                    <p>
                        DietDesk shall not be liable for indirect, incidental, or consequential damages arising
                        from use of the platform.
                    </p>
                </TrustSection>

                <TrustSection title="Termination">
                    <p>
                        We reserve the right to suspend or terminate accounts that violate these terms.
                    </p>
                </TrustSection>

                <TrustSection title="Contact">
                    <p>
                        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
                    </p>
                </TrustSection>
            </TrustDocument>
        </PublicPageShell>
    );
}
