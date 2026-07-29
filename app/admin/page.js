import { createClient } from '../../utils/supabase/server';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error('Failed to resolve the admin session:', authError.message);
    }

    if (!user) {
        return <LoginForm />;
    }

    const [galleryResult, settingsResult, processStagesResult, enquiriesResult, testimonialsResult, socialMediaResult] = await Promise.all([
        supabase
            .from('gallery_items')
            .select('id, image_url, storage_path, caption')
            .order('created_at', { ascending: true }),
        supabase.from('site_settings').select('whatsapp_number, logo_url').eq('id', 1).maybeSingle(),
        supabase
            .from('process_stages')
            .select('id, stage_name, image_url')
            .order('id', { ascending: true }),
        supabase
            .from('enquiries')
            .select('id, name, email, enquiry_type, message, status, created_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('testimonials')
            .select('id, quote, name, created_at')
            .eq('status', 'approved')
            .order('created_at', { ascending: false }),
        supabase
            .from('social_media_links')
            .select('id, title, url, created_at')
            .order('created_at', { ascending: true }),
    ]);

    const results = {
        gallery_items: galleryResult,
        site_settings: settingsResult,
        process_stages: processStagesResult,
        enquiries: enquiriesResult,
        testimonials: testimonialsResult,
        social_media_links: socialMediaResult,
    };

    const loadErrors = Object.entries(results)
        .filter(([, { error }]) => error)
        .map(([table, { error }]) => {
            console.error(`Failed to load ${table} for the admin dashboard:`, error.message);
            return table;
        });

    const { data: galleryItems } = galleryResult;
    const { data: settingsRow } = settingsResult;
    const { data: processStagesData } = processStagesResult;
    const { data: enquiries } = enquiriesResult;
    const { data: testimonials } = testimonialsResult;
    const { data: socialMediaLinks } = socialMediaResult;

    return (
        <Dashboard
            loadErrors={loadErrors}
            galleryItems={galleryItems ?? []}
            whatsappNumber={settingsRow?.whatsapp_number ?? ''}
            logo={settingsRow?.logo_url ?? ''}
            processStages={processStagesData ?? []}
            enquiries={enquiries ?? []}
            testimonials={testimonials ?? []}
            socialMediaLinks={socialMediaLinks ?? []}
        />
    );
}
