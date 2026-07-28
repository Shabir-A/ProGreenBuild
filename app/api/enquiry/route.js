import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ENQUIRY_TYPE_LABELS = {
    general: 'General Renovation Enquiry',
    bathroom: 'Bathroom Modification',
    kitchen: 'Kitchen Refit',
    'living-room': 'Living Room Renovation',
    'new-home': 'New Home Handover Inspection',
    resale: 'Resale Property Inspection',
    other: 'Other',
};

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { name, email, enquiryType, message } = body ?? {};

    if (!name || !email || !enquiryType) {
        return Response.json({ error: 'Name, email, and enquiry type are required.' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const enquiryLabel = ENQUIRY_TYPE_LABELS[enquiryType] ?? enquiryType;

    try {
        const { error } = await resend.emails.send({
            from: 'Pro Green Build <onboarding@resend.dev>',
            to: process.env.ENQUIRY_RECEIVING_EMAIL,
            replyTo: email,
            subject: `New enquiry: ${enquiryLabel}`,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Enquiry type: ${enquiryLabel}`,
                '',
                'Message:',
                message?.trim() ? message : '(no message provided)',
            ].join('\n'),
        });

        if (error) {
            return Response.json({ error: error.message ?? 'Failed to send email.' }, { status: 502 });
        }

        return Response.json({ success: true });
    } catch {
        return Response.json({ error: 'Something went wrong while sending your enquiry.' }, { status: 500 });
    }
}
