import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn();

vi.mock('../utils/supabase/public', () => ({ createClient: () => createClientMock() }));
vi.mock('../app/HomeClient', () => ({ default: function HomeClient() { return null; } }));

const Page = (await import('../app/page.js')).default;

/**
 * Stubs the five parallel queries the homepage issues, keyed by table name.
 * Any table left out resolves to `{ data: null }` so the null-handling paths
 * of the mapping code are exercised.
 */
function stubSupabase(tables = {}) {
    const client = {
        from: vi.fn((table) => {
            const result = Promise.resolve(
                table in tables ? { data: tables[table] } : { data: null }
            );
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
    createClientMock.mockReturnValue(client);
    return client;
}

beforeEach(() => {
    createClientMock.mockReset();
});

describe('homepage data mapping', () => {
    it('maps rows onto HomeClient props', async () => {
        stubSupabase({
            gallery_items: [
                { image_url: '/a.jpg', caption: 'Kitchen' },
                { image_url: '/b.jpg', caption: '' },
            ],
            site_settings: { whatsapp_number: '6591234567', logo_url: '/logo.png' },
            process_stages: [
                { id: 0, stage_name: 'Floor Plan', image_url: '/stage0.jpg' },
                { id: 1, stage_name: 'Demolition', image_url: null },
            ],
            testimonials: [{ quote: 'Great work', name: 'Ada' }],
            social_media_links: [{ title: 'Instagram', url: 'https://instagram.com/pgb' }],
        });

        const { props } = await Page();

        expect(props.galleryItems).toEqual([
            { src: '/a.jpg', caption: 'Kitchen' },
            { src: '/b.jpg', caption: 'Gallery' },
        ]);
        expect(props.processStages).toEqual([
            { label: 'Floor Plan', src: '/stage0.jpg', caption: 'Image for this stage' },
            { label: 'Demolition', src: '/images/gallery/placeholder.png', caption: 'Image for this stage' },
        ]);
        expect(props.whatsappNumber).toBe('6591234567');
        expect(props.logo).toBe('/logo.png');
        expect(props.testimonials).toEqual([{ quote: 'Great work', name: 'Ada' }]);
        expect(props.socialMediaLinks).toEqual([{ title: 'Instagram', url: 'https://instagram.com/pgb' }]);
    });

    it('falls back to empty props when the database returns nothing', async () => {
        stubSupabase();

        const { props } = await Page();

        expect(props).toEqual({
            galleryItems: [],
            whatsappNumber: '',
            logo: '',
            processStages: [],
            testimonials: [],
            socialMediaLinks: [],
        });
    });

    it('queries every content table exactly once', async () => {
        const client = stubSupabase();

        await Page();

        expect(client.from.mock.calls.flat()).toEqual([
            'gallery_items',
            'site_settings',
            'process_stages',
            'testimonials',
            'social_media_links',
        ]);
    });
});
