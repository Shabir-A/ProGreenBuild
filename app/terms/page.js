export default function Terms() {
    return (
        <main className="min-h-screen bg-white px-4 py-12 font-sans text-[#2f241b]">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-4xl font-bold tracking-[-0.02em] text-[#1c3624]">Terms and Conditions</h1>

                <div className="space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">2. Use License</h2>
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
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">3. Disclaimer</h2>
                        <p>
                            The materials on Pro Green Build's website are provided "as is". Pro Green Build makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">4. Limitations</h2>
                        <p>
                            In no event shall Pro Green Build or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pro Green Build's website.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">5. Accuracy of Materials</h2>
                        <p>
                            The materials appearing on Pro Green Build's website could include technical, typographical, or photographic errors. Pro Green Build does not warrant that any of the materials on the website are accurate, complete, or current. Pro Green Build may make changes to the materials contained on its website at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">6. Links</h2>
                        <p>
                            Pro Green Build has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Pro Green Build of the site. Use of any such linked website is at the user's own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">7. Modifications</h2>
                        <p>
                            Pro Green Build may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">8. Enquiries and Communications</h2>
                        <p>
                            When you submit an enquiry through our website, you authorize us to contact you via the methods you have indicated (email, WhatsApp, or phone). By providing your contact information, you consent to receive communications from Pro Green Build regarding your enquiry.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">9. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of Singapore, and you irrevocably submit to the exclusive jurisdiction of the courts in Singapore.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">10. Contact Information</h2>
                        <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                        <div className="mt-3 space-y-1 text-sm">
                            <p><span className="font-semibold">PROGREENBUILD PTE. LTD.</span></p>
                            <p>UEN: 202120698M</p>
                            <p>Email: <a href="mailto:contact@progreenbuild.com" className="text-[#6f8456] hover:underline">contact@progreenbuild.com</a></p>
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
