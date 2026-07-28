# ProGreenBuild Admin Dashboard & Renovation Portfolio

A modern web application for ProGreen Build to showcase their portfolio and manage client enquiries through a secure admin dashboard.

## Features

### Public Site
- Hero section with company branding and CTA
- 4-stage renovation process carousel with progress indicator
- Auto-scrolling portfolio gallery of completed projects
- Services grid listing core offerings and specialties
- Rotating client testimonials with auto-play
- About section with company story and values
- Contact options: email enquiry form, WhatsApp, and phone links
- Mobile responsive design across all breakpoints
- Success notification on enquiry submission

### Admin Dashboard
- Secure email/password login (Supabase Auth)
- Logo upload and management
- Process stage image uploads (4 stages: Floor Plan to Finished Result)
- Gallery image management (add/remove with captions)
- Contact settings (WhatsApp/phone number)
- Enquiry management (view, update status, delete with confirmation)
- Windows 95 style minimalist interface

### Data Features
- Gallery images pulled from Supabase
- Process stage images from database
- Dynamic contact number configuration
- Enquiry submissions logged to database
- Email delivery via Resend API
- Rate limiting on enquiry submissions (5 per minute per IP)
- Input validation for emails and form fields

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript
- Styling: Tailwind CSS 4
- Auth: Supabase Auth (email/password)
- Database: Supabase PostgreSQL with Row-Level Security
- Storage: Supabase Storage for images
- Email: Resend API
- Hosting: Vercel

### Prerequisites
- Node.js 18+
- Supabase project
- Vercel account (optional, for deployment)

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/progreenbuild.git
   cd progreenbuild
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in:
   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Supabase anon key
   - RESEND_API_KEY: Resend email API key
   - ENQUIRY_RECEIVING_EMAIL: Admin email for enquiry notifications

4. Set up Supabase
   - Run the SQL migration: supabase/migration_add_enquiries.sql
   - Create an admin user in Supabase Auth dashboard

5. Run locally
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Project Structure

```
app/
├── page.js                    Public homepage (server component)
├── HomeClient.js              Homepage (client component)
├── layout.js                  Root layout
├── globals.css                Global styles and animations
├── api/
│   └── enquiry/route.js       Email enquiry endpoint with rate limiting
└── admin/
    ├── page.js                Admin dashboard (server)
    ├── Dashboard.js           Admin UI (client)
    ├── LoginForm.js           Login page
    └── actions.js             Server actions (auth, uploads, enquiry management)

middleware.js                  Auth middleware for /admin routes
supabase/
└── migration_add_enquiries.sql Database schema for enquiries table

utils/
└── supabase/
    ├── client.js              Supabase client (browser)
    └── server.js              Supabase client (server)
```

## Authentication & Security

- Admin routes protected: `/admin/*` requires valid Supabase session
- Row-level security policies on all database tables
- File upload validation: type (JPG/PNG) and size (5MB max)
- Environment variables for secrets (.env.local, git-ignored)
- Session tokens stored in httpOnly cookies
- Email input validation (trim, lowercase, RFC 5321 compliance)
- Rate limiting on enquiry submissions (5 per minute per IP)
- Exception handling on login and form submission

### Create Admin Account
1. Go to Supabase dashboard, Authentication, Users
2. Click "Add user"
3. Enter email and password (disable public sign-ups)
4. Log in at /admin

## Database Schema

### Tables
- site_settings: Phone number, logo URL
- gallery_items: Portfolio images with captions
- process_stages: 4 renovation stages with images
- enquiries: Enquiry submissions with status tracking (pending_reply, awaiting_customer, converted, closed)

### Storage Buckets
- gallery: Public portfolio images
- site-assets: Logo and process stage images

## Admin Workflow

1. Visit /admin (redirects to login if not authenticated)
2. Review enquiries: view, update status, delete with confirmation
3. Upload logo: max 5MB JPG/PNG, appears in hero
4. Upload process stages: 2x2 grid, one image per stage
5. Add gallery images: portfolio showcase with required captions
6. Set contact number: WhatsApp and phone link (digits only)
7. Log out: clears session

## Deployment

Push to GitHub. Vercel auto-deploys.

Before deploying:
1. Add environment variables to Vercel project settings
2. Ensure Supabase RLS policies are active
3. Test admin login on staging
4. Test enquiry form and email delivery

## Email Integration

Enquiry form submissions send to configured email via Resend. Email address is configured in Resend API settings (not editable via app).

Form includes:
- Client-side validation (required fields)
- Server-side email format validation
- Success notification (green toast, 4 seconds)
- Error handling with user-friendly messages

## Author
Shabir Ali
