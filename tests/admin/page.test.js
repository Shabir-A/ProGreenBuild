import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn();

vi.mock('../../utils/supabase/server', () => ({ createClient: () => createClientMock() }));
vi.mock('../../app/admin/LoginForm', () => ({ default: function LoginForm() { return null; } }));
vi.mock('../../app/admin/Dashboard', () => ({ default: function Dashboard() { return null; } }));

const AdminPage = (await import('../../app/admin/page.js')).default;
const LoginForm = (await import('../../app/admin/LoginForm')).default;
const Dashboard = (await import('../../app/admin/Dashboard')).default;

/** Stubs the dashboard queries, keyed by table name. */
function stubSupabase({ user = { id: 'user-1' }, tables = {} } = {}) {
    const client = {
        auth: { getUser: vi.fn(() => Promise.resolve({ data: { user } })) },
        from: vi.fn((table) => {
            const result = Promise.resolve(table in tables ? { data: tables[table] } : { data: null });
            const builder = {
                select: vi.fn(() => builder),
                eq: vi.fn(() => builder),
                order: vi.fn(() => builder),
                maybeSingle: vi.fn(() => result),
                then: (onFulfilled, onRejected) => result.then(onFulfilled, onRejected),
            };
            return builder;
        }),
    };
    createClientMock.mockResolvedValue(client);
    return client;
}

beforeEach(() => {
    createClientMock.mockReset();
});

describe('admin page', () => {
    it('renders the login form when there is no session', async () => {
        const client = stubSupabase({ user: null });

        const element = await AdminPage();

        expect(element.type).toBe(LoginForm);
        expect(client.from).not.toHaveBeenCalled();
    });

    it('passes the loaded content to the dashboard', async () => {
        stubSupabase({
            tables: {
                gallery_items: [{ id: 1, image_url: '/a.jpg', storage_path: 'a.jpg', caption: 'Kitchen' }],
                site_settings: { whatsapp_number: '6591234567', logo_url: '/logo.png' },
                enquiries: [{ id: 10, name: 'Ada' }],
            },
        });

        const element = await AdminPage();

        expect(element.type).toBe(Dashboard);
        expect(element.props.galleryItems).toHaveLength(1);
        expect(element.props.whatsappNumber).toBe('6591234567');
        expect(element.props.logo).toBe('/logo.png');
        expect(element.props.enquiries).toEqual([{ id: 10, name: 'Ada' }]);
    });

    it('defaults every collection to an empty array when the queries return nothing', async () => {
        stubSupabase();

        const element = await AdminPage();

        expect(element.props).toEqual({
            galleryItems: [],
            whatsappNumber: '',
            logo: '',
            processStages: [],
            enquiries: [],
            testimonials: [],
            socialMediaLinks: [],
        });
    });
});
