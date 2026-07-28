# ProGreenBuild — Admin Dashboard & Renovation Portfolio

A modern web application for ProGreen Build to showcase their portfolio and manage client enquiries through a secure admin dashboard.

##  Features

### Public Site
- **Hero Section** — Eye-catching header with company branding and CTA
- **Our Process Carousel** — 4-stage renovation workflow with progress indicator
- **Gallery** — Auto-scrolling portfolio showcase of completed projects
- **Services Grid** — Core offerings and specialties
- **Testimonials** — Rotating client reviews with auto-play
- **About Section** — Company story and values
- **Contact Options** — Email enquiry form, WhatsApp, and phone links

### Admin Dashboard
- **Secure Login** — Email + password authentication (Supabase Auth)
- **Logo Management** — Upload and update company branding
- **Process Stages** — Upload images for 4 renovation stages (Floor Plan → Finished Result)
- **Gallery Management** — Add/remove portfolio images with captions
- **Contact Settings** — Update WhatsApp/phone number for client outreach
- **Boring UI** — Minimal, no-frills Windows 95 style interface

### Data Features
- Gallery images pulled from Supabase (not hardcoded)
- Process stage images from database
- Dynamic contact number (no hardcoding)
- Enquiry form stores submissions to database
- Email delivery via Resend

## 🛠️ Tech Stack

- **Frontend** — Next.js 16 (App Router), React 19, TypeScript
- **Styling** — Tailwind CSS 4
- **Auth** — Supabase Auth (email/password)
- **Database** — Supabase PostgreSQL with Row-Level Security
- **Storage** — Supabase Storage (images)
- **Email** — Resend API
- **Hosting** — Vercel

### Prerequisites
- Node.js 18+ 
- Supabase project
- Vercel account (optional, for deployment)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/progreenbuild.git
   cd progreenbuild
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
   - `RESEND_API_KEY` — Resend email API key

4. **Set up Supabase**
   - Run the SQL schema: `supabase/schema.sql`
   - Run the migration: `supabase/migration_add_logo_and_stages.sql`
   - Create an admin user in Supabase Auth dashboard

5. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## 📁 Project Structure

```
app/
├── page.js                    # Public homepage (server component)
├── HomeClient.js              # Homepage (client component)
├── layout.js                  # Root layout
├── globals.css                # Global styles + animations
├── api/
│   └── enquiry/route.js       # Email enquiry endpoint
└── admin/
    ├── page.js                # Admin dashboard (server)
    ├── Dashboard.js           # Admin UI (client)
    ├── LoginForm.js           # Login page
    └── actions.js             # Server actions (auth, uploads)

middleware.js                  # Auth middleware for /admin routes
supabase/
├── schema.sql                 # Initial database schema
└── migration_add_logo_and_stages.sql  # Add logo + process stages

utils/
└── supabase/
    ├── client.js              # Supabase client (browser)
    └── server.js              # Supabase client (server)
```
## 🔐 Authentication & Security

- **Admin Routes Protected** — `/admin/*` requires valid Supabase session
- **RLS Policies** — Database rows restricted by auth role
- **File Upload Validation** — Type (JPG/PNG) and size (5MB max) checks
- **No Hardcoded Secrets** — All keys in `.env.local` (git-ignored)
- **httpOnly Cookies** — Session tokens safe from XSS

### Create Admin Account
1. Go to Supabase dashboard → Authentication → Users
2. Click "Add user"
3. Enter email + password (don't enable public sign-ups)
4. Log in at `/admin`


## 📊 Database Schema

### Tables
- **`site_settings`** — Single row with phone number, logo URL
- **`gallery_items`** — Portfolio images with captions
- **`process_stages`** — 4 hardcoded renovation stages with images

### Storage Buckets
- **`gallery`** — Public portfolio images
- **`site-assets`** — Logo + process stage images


## 📝 Admin Workflow

1. **Visit** `/admin` (redirects to login if not authenticated)
2. **Upload Logo** — Max 5MB JPG/PNG, appears in hero section
3. **Upload Process Stages** — 2×2 grid, one image per stage (Floor Plan → Finished Result)
4. **Add Gallery Images** — Portfolio showcase, required caption per image
5. **Set Contact Number** — WhatsApp + phone link, digits only
6. **Log out** — Clears session


## 🚢 Deployment

Push to GitHub → Vercel auto-deploys

**Before deploying:**
1. Add env vars to Vercel project settings
2. Ensure Supabase RLS policies are active
3. Test admin login on staging
4. Verify email delivery with test enquiry


## 📧 Email Integration

Enquiry form sends to configured email via Resend. Currently hardcoded to admin's Resend account email. To change:
- Update `ENQUIRY_RECEIVING_EMAIL` in Supabase `site_settings` table (future enhancement)
- Or update `.env.local` and re-deploy


## 👤 Author
Shabir Ali
