'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
// Vercel serverless functions hard-cap request bodies at 4.5MB, so this must stay under that.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ENQUIRY_STATUSES = ['pending_reply', 'awaiting_customer', 'converted', 'closed'];

async function requireUser(supabase) {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
}

export async function login(_prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return { error: 'Enter your email and password.' };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return { error: 'Invalid email or password.' };
        }

        revalidatePath('/admin');
        redirect('/admin');
    } catch (err) {
        console.error('Login error:', err);
        return { error: 'Something went wrong. Please try again.' };
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/admin');
    redirect('/admin');
}

export async function addGalleryImage(_prevState, formData) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const file = formData.get('image');
    const caption = (formData.get('caption') || '').toString().trim();

    if (!caption) {
        return { error: 'Caption is required.' };
    }

    if (!file || typeof file === 'string' || file.size === 0) {
        return { error: 'Choose an image to upload.' };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { error: 'Only JPG or PNG images are allowed.' };
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return { error: 'Image must be 4MB or smaller.' };
    }

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file, {
        contentType: file.type,
    });
    if (uploadError) {
        return { error: 'Upload failed. Please try again.' };
    }

    const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(path);

    const { error: insertError } = await supabase.from('gallery_items').insert({
        image_url: publicUrlData.publicUrl,
        storage_path: path,
        caption: caption || null,
    });

    if (insertError) {
        await supabase.storage.from('gallery').remove([path]);
        return { error: 'Could not save the image. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteGalleryImage(id, storagePath) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    if (storagePath) {
        await supabase.storage.from('gallery').remove([storagePath]);
    }

    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (error) {
        return { error: 'Could not delete the image. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateEnquiryStatus(id, status) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    if (!ENQUIRY_STATUSES.includes(status)) {
        return { error: 'Invalid status.' };
    }

    const { error } = await supabase
        .from('enquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { error: 'Could not update status. Please try again.' };
    }

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteEnquiry(id) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) {
        return { error: 'Could not delete the enquiry. Please try again.' };
    }

    revalidatePath('/admin');
    return { success: true };
}

export async function updateWhatsappNumber(_prevState, formData) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const number = (formData.get('whatsapp_number') || '').toString().trim().replace(/[^\d]/g, '');

    const { error } = await supabase
        .from('site_settings')
        .update({ whatsapp_number: number, updated_at: new Date().toISOString() })
        .eq('id', 1);

    if (error) {
        return { error: 'Could not save the number. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateLogo(_prevState, formData) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const file = formData.get('logo');

    if (!file || typeof file === 'string' || file.size === 0) {
        return { error: 'Choose an image to upload.' };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { error: 'Only JPG or PNG images are allowed.' };
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return { error: 'Image must be 4MB or smaller.' };
    }

    // Get current logo path to delete old one
    const { data: settingsRow } = await supabase.from('site_settings').select('logo_storage_path').eq('id', 1).maybeSingle();

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, file, {
        contentType: file.type,
    });
    if (uploadError) {
        return { error: 'Upload failed. Please try again.' };
    }

    const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(path);

    // Delete old logo if exists
    if (settingsRow?.logo_storage_path) {
        await supabase.storage.from('site-assets').remove([settingsRow.logo_storage_path]);
    }

    const { error: updateError } = await supabase
        .from('site_settings')
        .update({ logo_url: publicUrlData.publicUrl, logo_storage_path: path, updated_at: new Date().toISOString() })
        .eq('id', 1);

    if (updateError) {
        await supabase.storage.from('site-assets').remove([path]);
        return { error: 'Could not save the logo. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateProcessStage(_prevState, formData) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const stageId = parseInt(formData.get('stage_id'), 10);
    const file = formData.get('image');

    if (isNaN(stageId) || stageId < 0 || stageId > 3) {
        return { error: 'Invalid stage.' };
    }

    if (!file || typeof file === 'string' || file.size === 0) {
        return { error: 'Choose an image to upload.' };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { error: 'Only JPG or PNG images are allowed.' };
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return { error: 'Image must be 4MB or smaller.' };
    }

    // Get current stage image path to delete old one
    const { data: stageRow } = await supabase.from('process_stages').select('storage_path').eq('id', stageId).maybeSingle();

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const path = `process-stages/${stageId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, file, {
        contentType: file.type,
    });
    if (uploadError) {
        return { error: 'Upload failed. Please try again.' };
    }

    const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(path);

    // Delete old image if exists
    if (stageRow?.storage_path) {
        await supabase.storage.from('site-assets').remove([stageRow.storage_path]);
    }

    const { error: updateError } = await supabase
        .from('process_stages')
        .update({ image_url: publicUrlData.publicUrl, storage_path: path, updated_at: new Date().toISOString() })
        .eq('id', stageId);

    if (updateError) {
        await supabase.storage.from('site-assets').remove([path]);
        return { error: 'Could not save the image. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function addTestimonial(_prevState, formData) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const quote = (formData.get('quote') || '').toString().trim();
    const name = (formData.get('name') || '').toString().trim();

    if (!quote || !name) {
        return { error: 'Quote and name are required.' };
    }

    if (quote.length > 500) {
        return { error: 'Quote must be 500 characters or less.' };
    }

    const { error } = await supabase.from('testimonials').insert({
        quote,
        name,
        status: 'approved',
    });

    if (error) {
        return { error: 'Could not add testimonial. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteTestimonial(id) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
        return { error: 'Could not delete testimonial. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function addSocialMediaLink(_prevState, formData) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const title = (formData.get('title') || '').toString().trim();
    const url = (formData.get('url') || '').toString().trim();

    if (!title || !url) {
        return { error: 'Title and URL are required.' };
    }

    if (!url.match(/^https?:\/\//)) {
        return { error: 'URL must start with http:// or https://' };
    }

    const { error } = await supabase.from('social_media_links').insert({
        title,
        url,
    });

    if (error) {
        return { error: 'Could not add social media link. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteSocialMediaLink(id) {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) {
        return { error: 'Not authorized.' };
    }

    const { error } = await supabase.from('social_media_links').delete().eq('id', id);
    if (error) {
        return { error: 'Could not delete social media link. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}
