// Shared layout and building blocks for the static legal pages (Terms, Privacy).
// Keeps the page wrapper, section styling, company contact details, and the
// "Last updated" line in one place so both pages stay visually consistent.

const COMPANY_NAME = 'PROGREENBUILD PTE. LTD.';
const COMPANY_UEN = 'UEN: 201622535Z';
const COMPANY_EMAIL = 'progreenbuild@gmail.com';

export function LegalSection({ heading, children }) {
    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold text-[#2c2118]">{heading}</h2>
            {children}
        </section>
    );
}

export function LegalContactSection({ heading, intro }) {
    return (
        <LegalSection heading={heading}>
            <p>{intro}</p>
            <div className="mt-3 space-y-1 text-sm">
                <p><span className="font-semibold">{COMPANY_NAME}</span></p>
                <p>{COMPANY_UEN}</p>
                <p>
                    Email:{' '}
                    <a href={`mailto:${COMPANY_EMAIL}`} className="text-[#6f8456] hover:underline">
                        {COMPANY_EMAIL}
                    </a>
                </p>
            </div>
        </LegalSection>
    );
}

export default function LegalPage({ title, children }) {
    const lastUpdated = new Date().toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <main className="min-h-screen bg-white px-4 py-12 font-sans text-[#2f241b]">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-4xl font-bold tracking-[-0.02em] text-[#1c3624]">{title}</h1>

                <div className="space-y-6 text-sm leading-relaxed">
                    {children}

                    <section className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
