const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: 'https', hostname: supabaseHostname, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  experimental: {
    serverActions: {
      // Vercel's hard payload ceiling for serverless functions is 4.5MB, so this must stay under that.
      bodySizeLimit: '4.5mb',
    },
  },
};

module.exports = nextConfig;
