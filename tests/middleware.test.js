import { beforeEach, describe, expect, it, vi } from 'vitest';

const nextSpy = vi.fn();
const createServerClientMock = vi.fn();

vi.mock('next/server', () => ({
    NextResponse: {
        next: (...args) => {
            nextSpy(...args);
            return {
                id: nextSpy.mock.calls.length,
                cookies: { set: vi.fn() },
            };
        },
    },
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: (...args) => createServerClientMock(...args),
}));

const { middleware, config } = await import('../middleware.js');

function createRequest(cookies = []) {
    return {
        cookies: {
            getAll: vi.fn(() => cookies),
            set: vi.fn(),
        },
    };
}

let getUser;

beforeEach(() => {
    nextSpy.mockClear();
    getUser = vi.fn(() => Promise.resolve({ data: { user: null } }));
    createServerClientMock.mockReset().mockImplementation(() => ({ auth: { getUser } }));
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
});

describe('middleware', () => {
    it('only runs on admin routes', () => {
        expect(config.matcher).toEqual(['/admin/:path*']);
    });

    it('builds the client from the public Supabase env vars', async () => {
        await middleware(createRequest());

        expect(createServerClientMock.mock.calls[0].slice(0, 2)).toEqual([
            'https://project.supabase.co',
            'anon-key',
        ]);
    });

    it('refreshes the session and returns the response', async () => {
        const response = await middleware(createRequest());

        expect(getUser).toHaveBeenCalledTimes(1);
        expect(response.id).toBe(1);
    });

    it('exposes the request cookies to Supabase', async () => {
        const cookies = [{ name: 'sb-access-token', value: 'abc' }];
        const request = createRequest(cookies);
        await middleware(request);

        const { cookies: handlers } = createServerClientMock.mock.calls[0][2];
        expect(handlers.getAll()).toEqual(cookies);
    });

    it('mirrors refreshed cookies onto the request and a rebuilt response', async () => {
        const request = createRequest();
        await middleware(request);
        nextSpy.mockClear();

        const { cookies: handlers } = createServerClientMock.mock.calls[0][2];
        handlers.setAll([{ name: 'sb-access-token', value: 'new', options: { httpOnly: true } }]);

        expect(request.cookies.set).toHaveBeenCalledWith('sb-access-token', 'new');
        // A fresh response must be created so the rewritten request headers are picked up.
        expect(nextSpy).toHaveBeenCalledWith({ request });
    });
});
