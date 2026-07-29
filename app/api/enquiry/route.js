import { Resend } from 'resend';
import { createClient } from '../../../utils/supabase/server';

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_TRACKED_IPS = 10000;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;

// Only headers set by the hosting proxy are trusted. `x-forwarded-for` is
// client-controllable, so the rightmost entry (added by the closest proxy) is
// used rather than the leftmost, which a caller can forge to dodge the limit.
function getClientIp(request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const lastHop = forwardedFor?.split(',').pop()?.trim();

    return request.headers.get('x-real-ip')?.trim() || lastHop || '127.0.0.1';
}

function checkRateLimit(ip) {
    const now = Date.now();

    for (const [key, times] of rateLimitStore) {
        if (times.every((time) => now - time >= RATE_LIMIT_WINDOW)) {
            rateLimitStore.delete(key);
        }
    }

    const record = rateLimitStore.get(ip);

    if (!record) {
        if (rateLimitStore.size >= RATE_LIMIT_MAX_TRACKED_IPS) {
            return false;
        }
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
    __proto__: null,
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

    if (typeof name !== 'string' || typeof email !== 'string' || typeof enquiryType !== 'string') {
        return Response.json({ error: 'Name, email, and enquiry type are required.' }, { status: 400 });
    }

    if (message !== undefined && message !== null && typeof message !== 'string') {
        return Response.json({ error: 'Invalid message.' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedMessage = (message ?? '').trim();

    if (!trimmedName || !email.trim() || !enquiryType) {
        return Response.json({ error: 'Name, email, and enquiry type are required.' }, { status: 400 });
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
        return Response.json({ error: `Name must be ${MAX_NAME_LENGTH} characters or less.` }, { status: 400 });
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        return Response.json(
            { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.` },
            { status: 400 }
        );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
        return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (trimmedEmail.length > 254) {
        return Response.json({ error: 'Email address is too long.' }, { status: 400 });
    }

    // Never echo a caller-supplied type back into the email subject: an
    // unrecognised value could carry newlines and forge extra mail headers.
    const enquiryLabel = ENQUIRY_TYPE_LABELS[enquiryType];
    if (typeof enquiryLabel !== 'string') {
        return Response.json({ error: 'Please choose a valid enquiry type.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: insertError } = await supabase.from('enquiries').insert({
        name: trimmedName,
        email: trimmedEmail,
        enquiry_type: enquiryType,
        message: trimmedMessage || null,
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
                `Name: ${trimmedName}`,
                `Email: ${trimmedEmail}`,
                `Enquiry type: ${enquiryLabel}`,
                '',
                'Message:',
                trimmedMessage || '(no message provided)',
            ].join('\n'),
        });

        if (error) {
            console.error('Failed to send enquiry email:', error.message);
            return Response.json({ error: 'Failed to send email. Please try again.' }, { status: 502 });
        }

        return Response.json({ success: true });
    } catch {
        return Response.json({ error: 'Something went wrong while sending your enquiry.' }, { status: 500 });
    }
}
