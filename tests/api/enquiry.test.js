import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock } from '../helpers/supabase.js';

const sendMock = vi.fn();
const createClientMock = vi.fn();

vi.mock('resend', () => ({
    Resend: class {
        constructor(apiKey) {
            this.apiKey = apiKey;
            this.emails = { send: sendMock };
        }
    },
}));

vi.mock('../../utils/supabase/server', () => ({
    createClient: () => createClientMock(),
}));

function makeRequest(body, headers = {}) {
    return new Request('https://progreenbuild.test/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
}

const validBody = {
    name: '  Ada  ',
    email: '  ADA@Example.COM ',
    enquiryType: 'kitchen',
    message: '  Need a quote  ',
};

let supabase;

/** Fresh module instance per test so the in-memory rate limit store is empty. */
async function loadRoute() {
    vi.resetModules();
    return (await import('../../app/api/enquiry/route.js')).POST;
}

beforeEach(() => {
    sendMock.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
    supabase = createSupabaseMock();
    createClientMock.mockReset().mockResolvedValue(supabase);
    process.env.RESEND_API_KEY = 'test-key';
    process.env.ENQUIRY_RECEIVING_EMAIL = 'admin@progreenbuild.test';
});

afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.ENQUIRY_RECEIVING_EMAIL;
});

describe('POST /api/enquiry validation', () => {
    it('rejects a body that is not valid JSON', async () => {
        const POST = await loadRoute();
        const response = await POST(makeRequest('{not json'));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid request body.' });
        expect(sendMock).not.toHaveBeenCalled();
    });

    it.each([
        ['name', { ...validBody, name: '' }],
        ['email', { ...validBody, email: '' }],
        ['enquiryType', { ...validBody, enquiryType: '' }],
    ])('requires %s', async (_field, body) => {
        const POST = await loadRoute();
        const response = await POST(makeRequest(body));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: 'Name, email, and enquiry type are required.',
        });
    });

    it.each(['ada', 'ada@example', 'ada @example.com', '@example.com'])(
        'rejects malformed email %s',
        async (email) => {
            const POST = await loadRoute();
            const response = await POST(makeRequest({ ...validBody, email }));

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({
                error: 'Please provide a valid email address.',
            });
        }
    );

    it('rejects an email longer than 254 characters', async () => {
        const POST = await loadRoute();
        const email = `${'a'.repeat(250)}@example.com`;
        const response = await POST(makeRequest({ ...validBody, email }));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Email address is too long.' });
    });
});

describe('POST /api/enquiry happy path', () => {
    it('logs the enquiry with trimmed, lowercased values and sends the email', async () => {
        const POST = await loadRoute();
        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true });

        expect(supabase.from).toHaveBeenCalledWith('enquiries');
        expect(supabase.calls).toEqual([
            {
                table: 'enquiries',
                operation: 'insert',
                values: {
                    name: 'Ada',
                    email: 'ada@example.com',
                    enquiry_type: 'kitchen',
                    message: 'Need a quote',
                },
            },
        ]);

        expect(sendMock).toHaveBeenCalledTimes(1);
        const email = sendMock.mock.calls[0][0];
        expect(email.to).toBe('admin@progreenbuild.test');
        expect(email.replyTo).toBe('ada@example.com');
        expect(email.subject).toBe('New enquiry: Kitchen Refit');
        expect(email.text).toContain('Name: Ada');
        expect(email.text).toContain('Email: ada@example.com');
        expect(email.text).toContain('Enquiry type: Kitchen Refit');
    });

    it('stores a null message when none is provided', async () => {
        const POST = await loadRoute();
        const response = await POST(makeRequest({ ...validBody, message: '   ' }));

        expect(response.status).toBe(200);
        expect(supabase.calls[0].values.message).toBeNull();
        expect(sendMock.mock.calls[0][0].text).toContain('(no message provided)');
    });

    it('falls back to the raw enquiry type when it has no friendly label', async () => {
        const POST = await loadRoute();
        await POST(makeRequest({ ...validBody, enquiryType: 'loft-conversion' }));

        expect(sendMock.mock.calls[0][0].subject).toBe('New enquiry: loft-conversion');
    });

    it('still sends the email when logging to the database fails', async () => {
        supabase = createSupabaseMock({
            results: { 'enquiries.insert': { error: { message: 'db down' } } },
        });
        createClientMock.mockResolvedValue(supabase);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        const POST = await loadRoute();
        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(200);
        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith('Failed to log enquiry:', 'db down');
        consoleError.mockRestore();
    });
});

describe('POST /api/enquiry email failures', () => {
    it('returns 500 when the email service is not configured', async () => {
        delete process.env.RESEND_API_KEY;

        const POST = await loadRoute();
        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: 'Email service is not configured.' });
        expect(sendMock).not.toHaveBeenCalled();
    });

    it('surfaces the provider error message as a 502', async () => {
        sendMock.mockResolvedValue({ error: { message: 'domain not verified' } });

        const POST = await loadRoute();
        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({ error: 'domain not verified' });
    });

    it('falls back to a generic message when the provider error has none', async () => {
        sendMock.mockResolvedValue({ error: {} });

        const POST = await loadRoute();
        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({ error: 'Failed to send email.' });
    });

    it('returns 500 when the provider throws', async () => {
        sendMock.mockRejectedValue(new Error('network'));

        const POST = await loadRoute();
        const response = await POST(makeRequest(validBody));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: 'Something went wrong while sending your enquiry.',
        });
    });
});

describe('POST /api/enquiry rate limiting', () => {
    it('allows five requests per IP then returns 429', async () => {
        const POST = await loadRoute();
        const headers = { 'x-forwarded-for': '203.0.113.5' };

        for (let i = 0; i < 5; i += 1) {
            const ok = await POST(makeRequest(validBody, headers));
            expect(ok.status).toBe(200);
        }

        const blocked = await POST(makeRequest(validBody, headers));
        expect(blocked.status).toBe(429);
        await expect(blocked.json()).resolves.toEqual({
            error: 'Too many requests. Please wait before sending another enquiry.',
        });
    });

    it('tracks each client IP independently', async () => {
        const POST = await loadRoute();

        for (let i = 0; i < 5; i += 1) {
            await POST(makeRequest(validBody, { 'x-forwarded-for': '203.0.113.5' }));
        }

        const other = await POST(makeRequest(validBody, { 'x-real-ip': '198.51.100.9' }));
        expect(other.status).toBe(200);
    });

    it('uses the first entry of a comma separated x-forwarded-for chain', async () => {
        const POST = await loadRoute();

        for (let i = 0; i < 5; i += 1) {
            await POST(makeRequest(validBody, { 'x-forwarded-for': ' 203.0.113.5 , 10.0.0.1' }));
        }

        const sameClient = await POST(makeRequest(validBody, { 'x-forwarded-for': '203.0.113.5' }));
        expect(sameClient.status).toBe(429);
    });

    it('falls back to cf-connecting-ip when no forwarding headers are present', async () => {
        const POST = await loadRoute();

        for (let i = 0; i < 5; i += 1) {
            await POST(makeRequest(validBody, { 'cf-connecting-ip': '203.0.113.7' }));
        }

        expect((await POST(makeRequest(validBody, { 'cf-connecting-ip': '203.0.113.7' }))).status).toBe(429);
        expect((await POST(makeRequest(validBody))).status).toBe(200);
    });

    it('lets requests through again once the window has elapsed', async () => {
        vi.useFakeTimers();
        try {
            const POST = await loadRoute();
            const headers = { 'x-forwarded-for': '203.0.113.5' };

            for (let i = 0; i < 5; i += 1) {
                await POST(makeRequest(validBody, headers));
            }
            expect((await POST(makeRequest(validBody, headers))).status).toBe(429);

            vi.advanceTimersByTime(61 * 1000);
            expect((await POST(makeRequest(validBody, headers))).status).toBe(200);
        } finally {
            vi.useRealTimers();
        }
    });
});
