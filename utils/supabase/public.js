import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

export function createClient() {
    const { url, key } = getSupabaseEnv();
    return createSupabaseClient(url, key);
}
