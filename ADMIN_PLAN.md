# Admin Panel Implementation Plan

## Overview
Lightweight admin dashboard with essential controls. No sensitive business data (prices, addresses) will be editable.

---

## Admin Features

### 1. **Admin Authentication**
- Simple login page (`/admin/login`)
- Email + password authentication
- Uses Supabase Auth for secure login
- Session management (stay logged in, logout option)
- Admin credentials stored in Supabase Auth
- Protect `/admin` routes with middleware

### 2. **Gallery Image Management**
- Upload new images to gallery
- Images stored in Supabase Storage
- Display list of current gallery items
- Delete gallery images
- Reorder gallery items (optional enhancement)
- File type validation (JPG, PNG only)
- File size limits (max 5MB per image)

### 3. **Enquiry Email Settings**
- Current receiving email display
- Ability to change the email address
- Store email setting in Supabase database (`admin_settings` table)
- When users submit contact form, email goes to this configured address

### 4. **User-Facing Changes (Contact Form)**
- Add simple contact form at the bottom (already has email/phone buttons)
- Form fields: Name, Email, Message
- On submission: send email to the admin's configured email address
- Success/error notifications to user
- No authentication needed for regular users

---

## What Admin CAN'T Do
- ❌ Edit pricing
- ❌ Edit addresses or location info
- ❌ Modify service descriptions
- ❌ Change testimonials (static for now)
- ❌ Access user data or analytics
- ❌ Change site design/layout

---

## Database Schema (Supabase)

### Table: `admin_settings`
```
- id (UUID, primary key)
- enquiry_email (text) - email to receive contact form submissions
- updated_at (timestamp)
- updated_by (UUID) - which admin made the change
```

### Table: `gallery_items`
```
- id (UUID, primary key)
- caption (text) - e.g., "Living Room"
- image_url (text) - Supabase Storage URL
- display_order (integer) - for ordering
- created_at (timestamp)
- updated_at (timestamp)
```

---

## Tech Stack
- **Frontend**: Next.js (existing)
- **Auth**: Supabase Auth (existing setup)
- **Storage**: Supabase Storage (for images)
- **Database**: Supabase PostgreSQL (existing)
- **Forms**: React Hook Form + Zod validation

---

## User Flow

### Admin Flow
1. Go to `/admin/login`
2. Enter email + password
3. Redirected to `/admin/dashboard`
4. Dashboard shows:
   - Gallery management section
   - Email settings section
5. Upload images → saved to Supabase Storage
6. Change email → updates in Supabase DB
7. Logout button clears session

### User Flow (Contact Enquiry)
1. Fill out contact form on homepage
2. Click "Send Enquiry"
3. Form data sent to API endpoint
4. Email sent to admin's configured email (via SendGrid/Resend)
5. Success message shown to user

---

## Implementation Phases

### Phase 1: Admin Auth + Dashboard Skeleton
- Login page UI
- Supabase Auth integration
- Protected admin routes
- Basic dashboard layout

### Phase 2: Gallery Management
- Image upload to Supabase Storage
- Gallery image display/list
- Delete functionality
- Update homepage to pull from database instead of hardcoded

### Phase 3: Email Settings
- Email config form
- Save to database
- Display current email

### Phase 4: Contact Form + Email Delivery
- Contact form on homepage
- Form submission handler
- Email delivery integration (SendGrid/Resend)
- Test with configured admin email

---

## Security Considerations
- Admin routes protected with middleware
- Only admin@company.com (or whitelisted emails) can log in
- Supabase RLS policies to restrict gallery/settings access
- API endpoints rate-limited
- File upload validation (type + size)
- Sanitize user input from contact form

---

## No Code Changes Yet
This is the plan. Ready to code once you approve this direction.
