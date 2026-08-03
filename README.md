# ProGreenBuild

Marketing site and lightweight admin dashboard for ProGreenBuild. The public site renders portfolio content from Supabase, and the admin area manages gallery images, process-stage visuals, testimonials, social links, contact number, and incoming enquiries.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase Auth, Database, and Storage
- Resend for enquiry email delivery

## Current Features

### Public site
- Homepage with hero, services, process stages, gallery, testimonials, social links, about, and contact sections
- Enquiry modal that posts to `/api/enquiry`
- WhatsApp CTA driven by the configured contact number
- Privacy policy and terms pages

### Admin area
- Login at `/admin`
- Session-backed access using Supabase Auth
- Manage gallery images and captions
- Upload logo and process stage images
- Add and delete testimonials
- Add and delete social media links
- Update WhatsApp/contact number
- View enquiries, change status, and delete enquiries

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
RESEND_API_KEY=your-resend-api-key
ENQUIRY_RECEIVING_EMAIL=your-inbox@example.com
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add `.env.local`.
3. Ensure your Supabase project has the required tables, buckets, and policies.
4. Apply [supabase/migration_public_read_policies.sql](C:/Users/shabi/ProGreenBuild/supabase/migration_public_read_policies.sql:1).
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Repo Layout

- `app/page.js`: server-rendered homepage data loader
- `app/HomeClient.js`: homepage UI and enquiry modal
- `app/api/enquiry/route.js`: enquiry submission endpoint and email send
- `app/admin/page.js`: admin page loader
- `app/admin/Dashboard.js`: admin client UI
- `app/admin/actions.js`: server actions for admin mutations
- `utils/supabase/public.js`: public Supabase client
- `utils/supabase/server.js`: server Supabase client
- `middleware.js`: session refresh for `/admin`

## Current Behavior Notes

- Homepage content is pulled live from Supabase rather than baked at build time.
- Public image rendering is configured for the current Supabase storage hostname.
- The enquiry endpoint logs to the `enquiries` table and then sends an email through Resend.
- The built-in rate limit is process-local and best-effort; it is not shared across deployments.

## Business Details

- Company: PROGREENBUILD PTE. LTD.
- UEN: 201622535Z
- Contact email: `progreenbuild@gmail.com`
