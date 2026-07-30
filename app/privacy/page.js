export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white px-4 py-12 font-sans text-[#2f241b]">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-4xl font-bold tracking-[-0.02em] text-[#1c3624]">Privacy Policy</h1>

                <div className="space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">1. Introduction</h2>
                        <p>
                            PROGREENBUILD PTE. LTD. ("we", "our", or "us") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and protect your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">2. Personal Data We Collect</h2>
                        <p>When you submit an enquiry through our website, we collect:</p>
                        <ul className="ml-4 mt-2 list-disc space-y-1">
                            <li>Your name</li>
                            <li>Your email address</li>
                            <li>Your phone number if you contact us through WhatsApp or otherwise provide it directly</li>
                            <li>Your enquiry type and message</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">3. How We Use Your Data</h2>
                        <p>We use your personal data for:</p>
                        <ul className="ml-4 mt-2 list-disc space-y-1">
                            <li>Internal customer tracking and enquiry management</li>
                            <li>Contacting you via email if you provided your email address</li>
                            <li>Contacting you via WhatsApp or phone call if you reach out to us through those channels or provide your number</li>
                            <li>Responding to your enquiries and providing services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">4. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Enquiry records are typically retained for business and legal purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">5. Your Rights</h2>
                        <p>Under Singapore's Personal Data Protection Act (PDPA), you have the right to:</p>
                        <ul className="ml-4 mt-2 list-disc space-y-1">
                            <li>Request access to your personal data</li>
                            <li>Request correction of inaccurate personal data</li>
                            <li>Opt out of marketing communications</li>
                            <li>Request withdrawal of consent to process your data</li>
                        </ul>
                        <p className="mt-3">To exercise these rights, please contact us at the details below.</p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">6. Data Security</h2>
                        <p>
                            We implement reasonable security measures to protect your personal data from unauthorised access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">7. Third Parties</h2>
                        <p>
                            We do not share, sell, or disclose your personal data to third parties, except where required by law or with your explicit consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">8. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">9. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
                        <div className="mt-3 space-y-1 text-sm">
                            <p><span className="font-semibold">PROGREENBUILD PTE. LTD.</span></p>
                            <p>UEN: 201622535Z</p>
                            <p>Email: <a href="mailto:progreenbuild@gmail.com" className="text-[#6f8456] hover:underline">progreenbuild@gmail.com</a></p>
                        </div>
                    </section>

                    <section className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
