// Shared Supabase connection values, read from public environment variables.
// Centralised here so the server, browser, public, and middleware clients stay in sync.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
