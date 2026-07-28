import { Resend } from 'resend';
import { createClient } from '../../../utils/supabase/server';

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getClientIp(request) {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        '127.0.0.1'
    );
}

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record) {
        rateLimitStore.set(ip, [now]);
        return true;
    }

    const recentRequests = record.filter((time) => now - time < RATE_LIMIT_WINDOW);
    if (recentRequests.length >= RATE_LIMIT_MAX) {
        return false;
    }

    recentRequests.push(now);
    rateLimitStore.set(ip, recentRequests);
    return true;
}

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
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
        return Response.json(
            { error: 'Too many requests. Please wait before sending another enquiry.' },
            { status: 429 }
        );
    }

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

    const trimmedEmail = email.toString().trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
        return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (trimmedEmail.length > 254) {
        return Response.json({ error: 'Email address is too long.' }, { status: 400 });
    }

    const enquiryLabel = ENQUIRY_TYPE_LABELS[enquiryType] ?? enquiryType;

    const supabase = await createClient();
    const { error: insertError } = await supabase.from('enquiries').insert({
        name: name.toString().trim(),
        email: trimmedEmail,
        enquiry_type: enquiryType,
        message: message?.toString().trim() || null,
    });

    if (insertError) {
        // Don't block the enquiry email on a logging failure — email delivery is the critical path.
        console.error('Failed to log enquiry:', insertError.message);
    }

    if (!process.env.RESEND_API_KEY) {
        return Response.json({ error: 'Email service is not configured.' }, { status: 500 });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
            from: 'Pro Green Build <onboarding@resend.dev>',
            to: process.env.ENQUIRY_RECEIVING_EMAIL,
            replyTo: trimmedEmail,
            subject: `New enquiry: ${enquiryLabel}`,
            text: [
                `Name: ${name.toString().trim()}`,
                `Email: ${trimmedEmail}`,
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
