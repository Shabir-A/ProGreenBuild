import { createClient } from '../utils/supabase/public';
import HomeClient from './HomeClient';

export default async function Page() {
    const supabase = createClient();

    const [{ data: galleryRows }, { data: settingsRow }, { data: processStagesData }, { data: testimonialRows }, { data: socialMediaRows }] = await Promise.all([
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

    const galleryItems = (galleryRows ?? []).map((row) => ({
        src: row.image_url,
        caption: row.caption || 'Gallery',
    }));

    const processStages = (processStagesData ?? []).map((stage) => ({
        label: stage.stage_name,
        src: stage.image_url || '/images/gallery/placeholder.png',
        caption: 'Image for this stage',
    }));

    return (
        <HomeClient
            galleryItems={galleryItems}
            whatsappNumber={settingsRow?.whatsapp_number ?? ''}
            logo={settingsRow?.logo_url ?? ''}
            processStages={processStages}
            testimonials={testimonialRows ?? []}
            socialMediaLinks={socialMediaRows ?? []}
        />
    );
}
