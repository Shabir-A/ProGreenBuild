-- Enquiries logging: stores every submission from the public "Email enquiry" form
-- so the admin can review, track, and manage them from /admin.

create table if not exists enquiries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    enquiry_type text not null,
    message text,
    status text not null default 'pending_reply'
        check (status in ('pending_reply', 'awaiting_customer', 'converted', 'closed')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on enquiries (created_at desc);

alter table enquiries enable row level security;

-- The public enquiry form runs server-side with the anon key, so anonymous
-- visitors need insert access. They must never be able to read, update, or
-- delete rows — only authenticated admins can do that.
create policy "Anyone can submit an enquiry"
    on enquiries for insert
    to anon, authenticated
    with check (true);

create policy "Authenticated users can view enquiries"
    on enquiries for select
    to authenticated
    using (true);

create policy "Authenticated users can update enquiries"
    on enquiries for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated users can delete enquiries"
    on enquiries for delete
    to authenticated
    using (true);
