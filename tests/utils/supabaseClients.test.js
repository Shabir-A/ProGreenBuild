import { beforeEach, describe, expect, it, vi } from 'vitest';

const createBrowserClient = vi.fn(() => ({ kind: 'browser' }));
const createServerClient = vi.fn(() => ({ kind: 'server' }));
const createSupabaseClient = vi.fn(() => ({ kind: 'public' }));
const cookiesMock = vi.fn();

vi.mock('@supabase/ssr', () => ({
    createBrowserClient: (...args) => createBrowserClient(...args),
    createServerClient: (...args) => createServerClient(...args),
}));
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args) => createSupabaseClient(...args),
}));
vi.mock('next/headers', () => ({ cookies: () => cookiesMock() }));

const { createClient: createBrowser } = await import('../../utils/supabase/client.js');
const { createClient: createPublic } = await import('../../utils/supabase/public.js');
const { createClient: createServer } = await import('../../utils/supabase/server.js');

const env = ['https://project.supabase.co', 'anon-key'];

let cookieStore;

beforeEach(() => {
    createBrowserClient.mockClear();
    createServerClient.mockClear();
    createSupabaseClient.mockClear();
    cookieStore = {
        getAll: vi.fn(() => [{ name: 'sb-access-token', value: 'abc' }]),
        set: vi.fn(),
    };
    cookiesMock.mockReset().mockResolvedValue(cookieStore);
    process.env.NEXT_PUBLIC_SUPABASE_URL = env[0];
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = env[1];
});

describe('browser client', () => {
    it('is built from the public env vars', () => {
        expect(createBrowser()).toEqual({ kind: 'browser' });
        expect(createBrowserClient).toHaveBeenCalledWith(...env);
    });
});

describe('public client', () => {
    it('uses the plain supabase-js client', () => {
        expect(createPublic()).toEqual({ kind: 'public' });
        expect(createSupabaseClient).toHaveBeenCalledWith(...env);
    });
});

describe('server client', () => {
    it('wires the Next cookie store into Supabase', async () => {
        expect(await createServer()).toEqual({ kind: 'server' });
        expect(createServerClient.mock.calls[0].slice(0, 2)).toEqual(env);

        const { cookies } = createServerClient.mock.calls[0][2];
        expect(cookies.getAll()).toEqual([{ name: 'sb-access-token', value: 'abc' }]);

        cookies.setAll([{ name: 'a', value: '1', options: { path: '/' } }]);
        expect(cookieStore.set).toHaveBeenCalledWith('a', '1', { path: '/' });
    });

    it('ignores cookie writes rejected during a Server Component render', async () => {
        cookieStore.set.mockImplementation(() => {
            throw new Error('Cookies can only be modified in a Server Action');
        });
        await createServer();

        const { cookies } = createServerClient.mock.calls[0][2];
        expect(() => cookies.setAll([{ name: 'a', value: '1', options: {} }])).not.toThrow();
    });
});
