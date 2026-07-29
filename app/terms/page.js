import LegalPage, { LegalSection, LegalContactSection } from '../_components/LegalPage';

export default function Terms() {
    return (
        <LegalPage title="Terms and Conditions">
            <LegalSection heading="1. Acceptance of Terms">
                <p>
                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
            </LegalSection>

            <LegalSection heading="2. Use License">
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on Pro Green Build's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
            </LegalSection>

            <LegalSection heading="3. Disclaimer">
                <p>
                    The materials on Pro Green Build's website are provided "as is". Pro Green Build makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
            </LegalSection>

            <LegalSection heading="4. Limitations">
                <p>
                    In no event shall Pro Green Build or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pro Green Build's website.
                </p>
            </LegalSection>

            <LegalSection heading="5. Accuracy of Materials">
                <p>
                    The materials appearing on Pro Green Build's website could include technical, typographical, or photographic errors. Pro Green Build does not warrant that any of the materials on the website are accurate, complete, or current. Pro Green Build may make changes to the materials contained on its website at any time without notice.
                </p>
            </LegalSection>

            <LegalSection heading="6. Links">
                <p>
                    Pro Green Build has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Pro Green Build of the site. Use of any such linked website is at the user's own risk.
                </p>
            </LegalSection>

            <LegalSection heading="7. Modifications">
                <p>
                    Pro Green Build may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
            </LegalSection>

            <LegalSection heading="8. Enquiries and Communications">
                <p>
                    When you submit an enquiry through our website, you authorize us to contact you via the methods you have indicated (email, WhatsApp, or phone). By providing your contact information, you consent to receive communications from Pro Green Build regarding your enquiry.
                </p>
            </LegalSection>

            <LegalSection heading="9. Governing Law">
                <p>
                    These terms and conditions are governed by and construed in accordance with the laws of Singapore, and you irrevocably submit to the exclusive jurisdiction of the courts in Singapore.
                </p>
            </LegalSection>

            <LegalContactSection
                heading="10. Contact Information"
                intro="If you have any questions about these Terms and Conditions, please contact us:"
            />
        </LegalPage>
    );
}
