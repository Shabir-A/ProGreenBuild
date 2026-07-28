import { createClient } from '../../utils/supabase/server';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <LoginForm />;
    }

    const [{ data: galleryItems }, { data: settingsRow }, { data: processStagesData }, { data: enquiries }] = await Promise.all([
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
    ]);

    return (
        <Dashboard
            galleryItems={galleryItems ?? []}
            whatsappNumber={settingsRow?.whatsapp_number ?? ''}
            logo={settingsRow?.logo_url ?? ''}
            processStages={processStagesData ?? []}
            enquiries={enquiries ?? []}
        />
    );
}
