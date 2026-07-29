import LegalPage, { LegalSection, LegalContactSection } from '../_components/LegalPage';

export default function PrivacyPolicy() {
    return (
        <LegalPage title="Privacy Policy">
            <LegalSection heading="1. Introduction">
                <p>
                    PROGREENBUILD PTE. LTD. ("we", "our", or "us") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and protect your information.
                </p>
            </LegalSection>

            <LegalSection heading="2. Personal Data We Collect">
                <p>When you submit an enquiry through our website, we collect:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                    <li>Your name</li>
                    <li>Your email address</li>
                    <li>Your phone number (if provided)</li>
                    <li>Your enquiry type and message</li>
                </ul>
            </LegalSection>

            <LegalSection heading="3. How We Use Your Data">
                <p>We use your personal data for:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                    <li>Internal customer tracking and enquiry management</li>
                    <li>Contacting you via email if you provided your email address</li>
                    <li>Contacting you via WhatsApp or phone call if you indicated preference for these methods</li>
                    <li>Responding to your enquiries and providing services</li>
                </ul>
            </LegalSection>

            <LegalSection heading="4. Data Retention">
                <p>
                    We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Enquiry records are typically retained for business and legal purposes.
                </p>
            </LegalSection>

            <LegalSection heading="5. Your Rights">
                <p>Under Singapore's Personal Data Protection Act (PDPA), you have the right to:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                    <li>Request access to your personal data</li>
                    <li>Request correction of inaccurate personal data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request withdrawal of consent to process your data</li>
                </ul>
                <p className="mt-3">To exercise these rights, please contact us at the details below.</p>
            </LegalSection>

            <LegalSection heading="6. Data Security">
                <p>
                    We implement reasonable security measures to protect your personal data from unauthorised access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
                </p>
            </LegalSection>

            <LegalSection heading="7. Third Parties">
                <p>
                    We do not share, sell, or disclose your personal data to third parties, except where required by law or with your explicit consent.
                </p>
            </LegalSection>

            <LegalSection heading="8. Changes to This Policy">
                <p>
                    We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date.
                </p>
            </LegalSection>

            <LegalContactSection
                heading="9. Contact Us"
                intro="If you have any questions about this Privacy Policy or our privacy practices, please contact us:"
            />
        </LegalPage>
    );
}
