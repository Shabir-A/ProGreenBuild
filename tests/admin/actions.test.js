import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFormData, createSupabaseMock, createUpload } from '../helpers/supabase.js';

const revalidatePath = vi.fn();
// The real `redirect` throws to unwind the render; the action wraps its call in a
// try/catch, so a throwing spy would only assert the catch branch. Keeping it a
// plain spy lets these tests assert the redirect target instead.
const redirect = vi.fn();
const createClientMock = vi.fn();

vi.mock('next/cache', () => ({ revalidatePath: (...args) => revalidatePath(...args) }));
vi.mock('next/navigation', () => ({ redirect: (...args) => redirect(...args) }));
vi.mock('../../utils/supabase/server', () => ({ createClient: () => createClientMock() }));

const actions = await import('../../app/admin/actions.js');

let supabase;

function useSupabase(options) {
    supabase = createSupabaseMock(options);
    createClientMock.mockResolvedValue(supabase);
    return supabase;
}

beforeEach(() => {
    revalidatePath.mockReset();
    redirect.mockReset();
    createClientMock.mockReset();
    useSupabase();
});

describe('login', () => {
    it('requires both email and password', async () => {
        await expect(actions.login(null, createFormData({ email: 'a@b.com' }))).resolves.toEqual({
            error: 'Enter your email and password.',
        });
        await expect(actions.login(null, createFormData({ password: 'pw' }))).resolves.toEqual({
            error: 'Enter your email and password.',
        });
        expect(createClientMock).not.toHaveBeenCalled();
    });

    it('signs in and redirects to the dashboard', async () => {
        await actions.login(null, createFormData({ email: 'a@b.com', password: 'pw' }));

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'a@b.com',
            password: 'pw',
        });
        expect(revalidatePath).toHaveBeenCalledWith('/admin');
        expect(redirect).toHaveBeenCalledWith('/admin');
    });

    it('returns a generic message on bad credentials without redirecting', async () => {
        useSupabase({ results: { 'auth.signInWithPassword': { error: { message: 'bad' } } } });

        await expect(
            actions.login(null, createFormData({ email: 'a@b.com', password: 'wrong' }))
        ).resolves.toEqual({ error: 'Invalid email or password.' });
        expect(redirect).not.toHaveBeenCalled();
    });

    it('handles unexpected failures', async () => {
        createClientMock.mockRejectedValue(new Error('offline'));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(
            actions.login(null, createFormData({ email: 'a@b.com', password: 'pw' }))
        ).resolves.toEqual({ error: 'Something went wrong. Please try again.' });
        consoleError.mockRestore();
    });
});

describe('logout', () => {
    it('signs out, revalidates and redirects', async () => {
        await actions.logout();

        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalledWith('/admin');
        expect(redirect).toHaveBeenCalledWith('/admin');
    });
});

describe('authorization', () => {
    const cases = [
        ['addGalleryImage', () => actions.addGalleryImage(null, createFormData({ caption: 'c' }))],
        ['deleteGalleryImage', () => actions.deleteGalleryImage(1, 'path.jpg')],
        ['updateEnquiryStatus', () => actions.updateEnquiryStatus(1, 'closed')],
        ['deleteEnquiry', () => actions.deleteEnquiry(1)],
        ['updateWhatsappNumber', () => actions.updateWhatsappNumber(null, createFormData({}))],
        ['updateLogo', () => actions.updateLogo(null, createFormData({}))],
        ['updateProcessStage', () => actions.updateProcessStage(null, createFormData({}))],
        ['addTestimonial', () => actions.addTestimonial(null, createFormData({}))],
        ['deleteTestimonial', () => actions.deleteTestimonial(1)],
        ['addSocialMediaLink', () => actions.addSocialMediaLink(null, createFormData({}))],
        ['deleteSocialMediaLink', () => actions.deleteSocialMediaLink(1)],
    ];

    it.each(cases)('%s refuses to run without a signed in user', async (_name, run) => {
        useSupabase({ user: null });

        await expect(run()).resolves.toEqual({ error: 'Not authorized.' });
        expect(supabase.calls).toEqual([]);
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});

describe('addGalleryImage', () => {
    const validForm = (overrides = {}) =>
        createFormData({ caption: '  Kitchen  ', image: createUpload(), ...overrides });

    it('requires a caption', async () => {
        await expect(
            actions.addGalleryImage(null, createFormData({ caption: '   ', image: createUpload() }))
        ).resolves.toEqual({ error: 'Caption is required.' });
    });

    it.each([
        ['no file', undefined, 'Choose an image to upload.'],
        ['an empty file input', '', 'Choose an image to upload.'],
        ['a zero byte file', createUpload({ size: 0 }), 'Choose an image to upload.'],
        ['a GIF', createUpload({ type: 'image/gif' }), 'Only JPG or PNG images are allowed.'],
        ['an oversized file', createUpload({ size: 5 * 1024 * 1024 + 1 }), 'Image must be 5MB or smaller.'],
    ])('rejects %s', async (_label, image, error) => {
        await expect(actions.addGalleryImage(null, validForm({ image }))).resolves.toEqual({ error });
        expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('uploads the file and stores the public URL with a trimmed caption', async () => {
        const result = await actions.addGalleryImage(null, validForm());

        expect(result).toEqual({ success: true });
        const upload = supabase.calls.find((c) => c.operation === 'upload');
        expect(upload.bucket).toBe('gallery');
        expect(upload.path).toMatch(/^user-1\/\d+-[a-z0-9]+\.jpg$/);
        expect(upload.options).toEqual({ contentType: 'image/jpeg' });

        const insert = supabase.calls.find((c) => c.operation === 'insert');
        expect(insert.table).toBe('gallery_items');
        expect(insert.values).toEqual({
            image_url: `https://cdn.test/gallery/${upload.path}`,
            storage_path: upload.path,
            caption: 'Kitchen',
        });
        expect(revalidatePath).toHaveBeenCalledWith('/admin');
        expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('uses a png extension for png uploads', async () => {
        await actions.addGalleryImage(null, validForm({ image: createUpload({ type: 'image/png' }) }));

        expect(supabase.calls.find((c) => c.operation === 'upload').path).toMatch(/\.png$/);
    });

    it('reports upload failures without touching the table', async () => {
        useSupabase({ results: { 'gallery.upload': { error: { message: 'quota' } } } });

        await expect(actions.addGalleryImage(null, validForm())).resolves.toEqual({
            error: 'Upload failed. Please try again.',
        });
        expect(supabase.calls.some((c) => c.operation === 'insert')).toBe(false);
    });

    it('removes the uploaded file when the row insert fails', async () => {
        useSupabase({ results: { 'gallery_items.insert': { error: { message: 'constraint' } } } });

        await expect(actions.addGalleryImage(null, validForm())).resolves.toEqual({
            error: 'Could not save the image. Please try again.',
        });
        const uploadedPath = supabase.calls.find((c) => c.operation === 'upload').path;
        expect(supabase.calls.find((c) => c.operation === 'remove').paths).toEqual([uploadedPath]);
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});

describe('deleteGalleryImage', () => {
    it('removes the stored file and the row', async () => {
        await expect(actions.deleteGalleryImage(7, 'user-1/photo.jpg')).resolves.toEqual({ success: true });

        expect(supabase.calls).toEqual([
            { bucket: 'gallery', operation: 'remove', paths: ['user-1/photo.jpg'] },
            { table: 'gallery_items', operation: 'delete', values: undefined, filters: [['id', 7]] },
        ]);
    });

    it('skips storage removal when no path is stored', async () => {
        await actions.deleteGalleryImage(7, null);

        expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('reports delete failures', async () => {
        useSupabase({ results: { 'gallery_items.delete': { error: { message: 'rls' } } } });

        await expect(actions.deleteGalleryImage(7, null)).resolves.toEqual({
            error: 'Could not delete the image. Please try again.',
        });
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});

describe('updateEnquiryStatus', () => {
    it.each(['pending_reply', 'awaiting_customer', 'converted', 'closed'])(
        'accepts the %s status',
        async (status) => {
            await expect(actions.updateEnquiryStatus(3, status)).resolves.toEqual({ success: true });

            const update = supabase.calls.find((c) => c.operation === 'update');
            expect(update.table).toBe('enquiries');
            expect(update.values.status).toBe(status);
            expect(update.values.updated_at).toEqual(expect.any(String));
            expect(update.filters).toEqual([['id', 3]]);
        }
    );

    it.each(['spam', '', null, 'PENDING_REPLY'])('rejects the invalid status %s', async (status) => {
        await expect(actions.updateEnquiryStatus(3, status)).resolves.toEqual({ error: 'Invalid status.' });
        expect(supabase.calls).toEqual([]);
    });

    it('reports update failures', async () => {
        useSupabase({ results: { 'enquiries.update': { error: { message: 'rls' } } } });

        await expect(actions.updateEnquiryStatus(3, 'closed')).resolves.toEqual({
            error: 'Could not update status. Please try again.',
        });
    });
});

describe('deleteEnquiry', () => {
    it('deletes the row and revalidates the dashboard only', async () => {
        await expect(actions.deleteEnquiry(11)).resolves.toEqual({ success: true });

        expect(supabase.calls).toEqual([
            { table: 'enquiries', operation: 'delete', values: undefined, filters: [['id', 11]] },
        ]);
        expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/admin');
    });

    it('reports delete failures', async () => {
        useSupabase({ results: { 'enquiries.delete': { error: { message: 'rls' } } } });

        await expect(actions.deleteEnquiry(11)).resolves.toEqual({
            error: 'Could not delete the enquiry. Please try again.',
        });
    });
});

describe('updateWhatsappNumber', () => {
    it.each([
        ['  +65 9123 4567 ', '6591234567'],
        ['(65) 9123-4567', '6591234567'],
        ['', ''],
    ])('normalizes %s to digits only', async (input, expected) => {
        await expect(
            actions.updateWhatsappNumber(null, createFormData({ whatsapp_number: input }))
        ).resolves.toEqual({ success: true });

        const update = supabase.calls.find((c) => c.operation === 'update');
        expect(update.table).toBe('site_settings');
        expect(update.values.whatsapp_number).toBe(expected);
        expect(update.filters).toEqual([['id', 1]]);
    });

    it('reports update failures', async () => {
        useSupabase({ results: { 'site_settings.update': { error: { message: 'rls' } } } });

        await expect(
            actions.updateWhatsappNumber(null, createFormData({ whatsapp_number: '123' }))
        ).resolves.toEqual({ error: 'Could not save the number. Please try again.' });
    });
});

describe('updateLogo', () => {
    const validForm = (overrides = {}) => createFormData({ logo: createUpload(), ...overrides });

    it.each([
        ['no file', undefined, 'Choose an image to upload.'],
        ['a zero byte file', createUpload({ size: 0 }), 'Choose an image to upload.'],
        ['a PDF', createUpload({ type: 'application/pdf' }), 'Only JPG or PNG images are allowed.'],
        ['an oversized file', createUpload({ size: 5 * 1024 * 1024 + 1 }), 'Image must be 5MB or smaller.'],
    ])('rejects %s', async (_label, logo, error) => {
        await expect(actions.updateLogo(null, validForm({ logo }))).resolves.toEqual({ error });
    });

    it('uploads the new logo and points site_settings at it', async () => {
        await expect(actions.updateLogo(null, validForm())).resolves.toEqual({ success: true });

        const upload = supabase.calls.find((c) => c.operation === 'upload');
        expect(upload.bucket).toBe('site-assets');
        expect(upload.path).toMatch(/^logos\/\d+-[a-z0-9]+\.jpg$/);

        const update = supabase.calls.find((c) => c.operation === 'update');
        expect(update.values).toEqual({
            logo_url: `https://cdn.test/site-assets/${upload.path}`,
            logo_storage_path: upload.path,
            updated_at: expect.any(String),
        });
        expect(supabase.calls.some((c) => c.operation === 'remove')).toBe(false);
    });

    it('deletes the previous logo when one exists', async () => {
        useSupabase({
            results: { 'site_settings.select': { data: { logo_storage_path: 'logos/old.png' } } },
        });

        await actions.updateLogo(null, validForm());

        expect(supabase.calls.find((c) => c.operation === 'remove').paths).toEqual(['logos/old.png']);
    });

    it('reports upload failures', async () => {
        useSupabase({ results: { 'site-assets.upload': { error: { message: 'quota' } } } });

        await expect(actions.updateLogo(null, validForm())).resolves.toEqual({
            error: 'Upload failed. Please try again.',
        });
    });

    it('removes the new file when the settings update fails', async () => {
        useSupabase({ results: { 'site_settings.update': { error: { message: 'rls' } } } });

        await expect(actions.updateLogo(null, validForm())).resolves.toEqual({
            error: 'Could not save the logo. Please try again.',
        });
        const uploadedPath = supabase.calls.find((c) => c.operation === 'upload').path;
        expect(supabase.calls.filter((c) => c.operation === 'remove').at(-1).paths).toEqual([uploadedPath]);
    });
});

describe('updateProcessStage', () => {
    const validForm = (overrides = {}) =>
        createFormData({ stage_id: '2', image: createUpload({ type: 'image/png' }), ...overrides });

    it.each(['-1', '4', 'abc', ''])('rejects the out of range stage %s', async (stageId) => {
        await expect(actions.updateProcessStage(null, validForm({ stage_id: stageId }))).resolves.toEqual({
            error: 'Invalid stage.',
        });
    });

    it.each([
        ['no file', undefined, 'Choose an image to upload.'],
        ['a webp', createUpload({ type: 'image/webp' }), 'Only JPG or PNG images are allowed.'],
        ['an oversized file', createUpload({ size: 5 * 1024 * 1024 + 1 }), 'Image must be 5MB or smaller.'],
    ])('rejects %s', async (_label, image, error) => {
        await expect(actions.updateProcessStage(null, validForm({ image }))).resolves.toEqual({ error });
    });

    it('stores the image against the stage row', async () => {
        await expect(actions.updateProcessStage(null, validForm())).resolves.toEqual({ success: true });

        const upload = supabase.calls.find((c) => c.operation === 'upload');
        expect(upload.path).toMatch(/^process-stages\/2-\d+\.png$/);

        const update = supabase.calls.find((c) => c.operation === 'update');
        expect(update.table).toBe('process_stages');
        expect(update.filters).toEqual([['id', 2]]);
        expect(update.values.image_url).toBe(`https://cdn.test/site-assets/${upload.path}`);
    });

    it('deletes the previous stage image when one exists', async () => {
        useSupabase({
            results: { 'process_stages.select': { data: { storage_path: 'process-stages/2-old.jpg' } } },
        });

        await actions.updateProcessStage(null, validForm());

        expect(supabase.calls.find((c) => c.operation === 'remove').paths).toEqual([
            'process-stages/2-old.jpg',
        ]);
    });

    it('removes the new file when the stage update fails', async () => {
        useSupabase({ results: { 'process_stages.update': { error: { message: 'rls' } } } });

        await expect(actions.updateProcessStage(null, validForm())).resolves.toEqual({
            error: 'Could not save the image. Please try again.',
        });
        const uploadedPath = supabase.calls.find((c) => c.operation === 'upload').path;
        expect(supabase.calls.filter((c) => c.operation === 'remove').at(-1).paths).toEqual([uploadedPath]);
    });

    it('reports upload failures', async () => {
        useSupabase({ results: { 'site-assets.upload': { error: { message: 'quota' } } } });

        await expect(actions.updateProcessStage(null, validForm())).resolves.toEqual({
            error: 'Upload failed. Please try again.',
        });
    });
});

describe('addTestimonial', () => {
    it.each([
        ['a missing quote', { quote: '  ', name: 'Ada' }],
        ['a missing name', { quote: 'Great work', name: ' ' }],
    ])('rejects %s', async (_label, entries) => {
        await expect(actions.addTestimonial(null, createFormData(entries))).resolves.toEqual({
            error: 'Quote and name are required.',
        });
    });

    it('rejects a quote longer than 500 characters', async () => {
        await expect(
            actions.addTestimonial(null, createFormData({ quote: 'x'.repeat(501), name: 'Ada' }))
        ).resolves.toEqual({ error: 'Quote must be 500 characters or less.' });
    });

    it('accepts a quote of exactly 500 characters', async () => {
        await expect(
            actions.addTestimonial(null, createFormData({ quote: 'x'.repeat(500), name: 'Ada' }))
        ).resolves.toEqual({ success: true });
    });

    it('inserts a trimmed, pre-approved testimonial', async () => {
        await expect(
            actions.addTestimonial(null, createFormData({ quote: '  Great work  ', name: '  Ada  ' }))
        ).resolves.toEqual({ success: true });

        expect(supabase.calls).toEqual([
            {
                table: 'testimonials',
                operation: 'insert',
                values: { quote: 'Great work', name: 'Ada', status: 'approved' },
            },
        ]);
    });

    it('reports insert failures', async () => {
        useSupabase({ results: { 'testimonials.insert': { error: { message: 'rls' } } } });

        await expect(
            actions.addTestimonial(null, createFormData({ quote: 'Great work', name: 'Ada' }))
        ).resolves.toEqual({ error: 'Could not add testimonial. Please try again.' });
    });
});

describe('deleteTestimonial', () => {
    it('deletes the row', async () => {
        await expect(actions.deleteTestimonial(5)).resolves.toEqual({ success: true });

        expect(supabase.calls).toEqual([
            { table: 'testimonials', operation: 'delete', values: undefined, filters: [['id', 5]] },
        ]);
    });

    it('reports delete failures', async () => {
        useSupabase({ results: { 'testimonials.delete': { error: { message: 'rls' } } } });

        await expect(actions.deleteTestimonial(5)).resolves.toEqual({
            error: 'Could not delete testimonial. Please try again.',
        });
    });
});

describe('addSocialMediaLink', () => {
    it.each([
        ['a missing title', { title: ' ', url: 'https://example.com' }],
        ['a missing url', { title: 'Instagram', url: '  ' }],
    ])('rejects %s', async (_label, entries) => {
        await expect(actions.addSocialMediaLink(null, createFormData(entries))).resolves.toEqual({
            error: 'Title and URL are required.',
        });
    });

    it.each(['example.com', 'ftp://example.com', 'javascript:alert(1)'])(
        'rejects the non http(s) url %s',
        async (url) => {
            await expect(
                actions.addSocialMediaLink(null, createFormData({ title: 'Instagram', url }))
            ).resolves.toEqual({ error: 'URL must start with http:// or https://' });
        }
    );

    it.each(['http://example.com', 'https://example.com/progreen'])('accepts %s', async (url) => {
        await expect(
            actions.addSocialMediaLink(null, createFormData({ title: '  Instagram  ', url: ` ${url} ` }))
        ).resolves.toEqual({ success: true });

        expect(supabase.calls).toEqual([
            { table: 'social_media_links', operation: 'insert', values: { title: 'Instagram', url } },
        ]);
    });

    it('reports insert failures', async () => {
        useSupabase({ results: { 'social_media_links.insert': { error: { message: 'rls' } } } });

        await expect(
            actions.addSocialMediaLink(null, createFormData({ title: 'Instagram', url: 'https://example.com' }))
        ).resolves.toEqual({ error: 'Could not add social media link. Please try again.' });
    });
});

describe('deleteSocialMediaLink', () => {
    it('deletes the row', async () => {
        await expect(actions.deleteSocialMediaLink(9)).resolves.toEqual({ success: true });

        expect(supabase.calls).toEqual([
            { table: 'social_media_links', operation: 'delete', values: undefined, filters: [['id', 9]] },
        ]);
    });

    it('reports delete failures', async () => {
        useSupabase({ results: { 'social_media_links.delete': { error: { message: 'rls' } } } });

        await expect(actions.deleteSocialMediaLink(9)).resolves.toEqual({
            error: 'Could not delete social media link. Please try again.',
        });
    });
});
