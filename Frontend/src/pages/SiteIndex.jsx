import { Link } from "react-router-dom";
import PublicPageShell from "../components/PublicPageShell";
import TrustDocument, { TrustSection } from "../components/TrustDocument";

export default function SiteIndex() {
    return (
        <PublicPageShell
            title="Site Index"
            description="Directory and index of all public pages, tools, and legal documentation for DietDesk."
            canonical="https://dietdesk.online/site-index"
        >
            <TrustDocument
                title="Site Index"
                subtitle="Complete directory of public pages, clinical resources, and legal policies for DietDesk."
            >
                <TrustSection title="Public Navigation">
                    <p>
                        DietDesk provides clinical nutrition software for dietitians and nutrition students. Browse our main public resources below:
                    </p>
                    <ul style={{ paddingLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
                        <li>
                            <Link to="/"><strong>DietDesk Home</strong></Link> &mdash; Overview of clinical nutrition software, meal planner, macro calculator, and PDF reporting features.
                        </li>
                        <li>
                            <Link to="/login"><strong>Sign In</strong></Link> &mdash; Account login for registered clinical dietitians and practitioners.
                        </li>
                        <li>
                            <Link to="/signup"><strong>Get Started</strong></Link> &mdash; Registration for dietitians and students seeking clinical nutrition tools.
                        </li>
                    </ul>
                </TrustSection>

                <TrustSection title="Legal &amp; Privacy Policies">
                    <p>
                        We take patient data privacy, security, and healthcare regulatory compliance seriously:
                    </p>
                    <ul style={{ paddingLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
                        <li>
                            <Link to="/privacy"><strong>Privacy Policy</strong></Link> &mdash; Explains our data collection, processing, and retention standards.
                        </li>
                        <li>
                            <Link to="/terms"><strong>Terms of Service</strong></Link> &mdash; Clinical usage terms, account responsibilities, and subscription terms.
                        </li>
                        <li>
                            <Link to="/security"><strong>Security Policy</strong></Link> &mdash; Technical safeguards, encryption, and organizational security controls.
                        </li>
                    </ul>
                </TrustSection>

                <TrustSection title="Support &amp; Contact">
                    <p>
                        Need assistance or have clinical feedback? Reach out directly to our team:
                    </p>
                    <ul style={{ paddingLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
                        <li>
                            <Link to="/contact"><strong>Contact Us</strong></Link> &mdash; Support channels for clinical queries, security reports, and technical help.
                        </li>
                    </ul>
                </TrustSection>

                <TrustSection title="Machine-Readable Indexes">
                    <p>
                        For search engine crawlers, automated auditing, and plain-text indexing:
                    </p>
                    <ul style={{ paddingLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
                        <li>
                            <a href="/public-urls.txt"><strong>public-urls.txt</strong></a> &mdash; Plain-text list of all canonical public URLs.
                        </li>
                        <li>
                            <a href="/sitemap.xml"><strong>sitemap.xml</strong></a> &mdash; XML sitemap protocol with last-modified timestamps.
                        </li>
                        <li>
                            <a href="/robots.txt"><strong>robots.txt</strong></a> &mdash; Robots exclusion standard file.
                        </li>
                    </ul>
                </TrustSection>
            </TrustDocument>
        </PublicPageShell>
    );
}
