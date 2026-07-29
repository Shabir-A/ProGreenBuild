import { createClient } from '../utils/supabase/public';
import HomeClient from './HomeClient';

// Homepage content is edited from /admin, so never serve a build-time snapshot.
export const revalidate = 0;

export default async function Page() {
    const supabase = createClient();

    const [gallery, settings, stages, testimonials, socialMedia] = await Promise.all([
        supabase.from('gallery_items').select('image_url, caption').order('created_at', { ascending: true }),
        supabase.from('site_settings').select('whatsapp_number, logo_url').eq('id', 1).maybeSingle(),
        supabase
            .from('process_stages')
            .select('id, stage_name, image_url')
            .order('id', { ascending: true }),
        supabase
            .from('testimonials')
            .select('quote, name')
            .eq('status', 'approved')
            .order('created_at', { ascending: false }),
        supabase
            .from('social_media_links')
            .select('title, url')
            .order('created_at', { ascending: true }),
    ]);

    // A missing anon SELECT policy makes Supabase return an error or zero rows,
    // which otherwise looks identical to "the admin has not added content yet".
    for (const [table, { error }] of Object.entries({
        gallery_items: gallery,
        site_settings: settings,
        process_stages: stages,
        testimonials,
        social_media_links: socialMedia,
    })) {
        if (error) {
            console.error(`Homepage query failed for ${table}:`, error.message);
        }
    }

    const galleryItems = (gallery.data ?? []).map((row) => ({
        src: row.image_url,
        caption: row.caption || 'Gallery',
    }));

    const processStages = (stages.data ?? []).map((stage) => ({
        label: stage.stage_name,
        src: stage.image_url || '/images/gallery/placeholder.png',
        caption: 'Image for this stage',
    }));

    return (
        <HomeClient
            galleryItems={galleryItems}
            whatsappNumber={settings.data?.whatsapp_number ?? ''}
            logo={settings.data?.logo_url ?? ''}
            processStages={processStages}
            testimonials={testimonials.data ?? []}
            socialMediaLinks={socialMedia.data ?? []}
        />
    );
}
