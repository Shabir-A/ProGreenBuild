-- Public read access for the content the homepage renders.
--
-- The public homepage is rendered server-side with the anon key (no admin
-- session), so every table it reads needs a SELECT policy granted to anon.
-- Without it, row-level security silently returns zero rows and sections such
-- as "Follow us" fall back to "Coming soon" even though the admin dashboard
-- (which queries with an authenticated session) shows the rows.
--
-- Safe to re-run: policies are dropped before being recreated.

alter table social_media_links enable row level security;
alter table testimonials enable row level security;
alter table gallery_items enable row level security;
alter table process_stages enable row level security;
alter table site_settings enable row level security;

-- social_media_links
drop policy if exists "Public can view social media links" on social_media_links;
create policy "Public can view social media links"
    on social_media_links for select
    to anon, authenticated
    using (true);

drop policy if exists "Authenticated users can manage social media links" on social_media_links;
create policy "Authenticated users can manage social media links"
    on social_media_links for all
    to authenticated
    using (true)
    with check (true);

-- testimonials (homepage only reads approved ones, admins read all)
drop policy if exists "Public can view approved testimonials" on testimonials;
create policy "Public can view approved testimonials"
    on testimonials for select
    to anon
    using (status = 'approved');

drop policy if exists "Authenticated users can manage testimonials" on testimonials;
create policy "Authenticated users can manage testimonials"
    on testimonials for all
    to authenticated
    using (true)
    with check (true);

-- gallery_items
drop policy if exists "Public can view gallery items" on gallery_items;
create policy "Public can view gallery items"
    on gallery_items for select
    to anon, authenticated
    using (true);

drop policy if exists "Authenticated users can manage gallery items" on gallery_items;
create policy "Authenticated users can manage gallery items"
    on gallery_items for all
    to authenticated
    using (true)
    with check (true);

-- process_stages
drop policy if exists "Public can view process stages" on process_stages;
create policy "Public can view process stages"
    on process_stages for select
    to anon, authenticated
    using (true);

drop policy if exists "Authenticated users can manage process stages" on process_stages;
create policy "Authenticated users can manage process stages"
    on process_stages for all
    to authenticated
    using (true)
    with check (true);

-- site_settings
drop policy if exists "Public can view site settings" on site_settings;
create policy "Public can view site settings"
    on site_settings for select
    to anon, authenticated
    using (true);

drop policy if exists "Authenticated users can manage site settings" on site_settings;
create policy "Authenticated users can manage site settings"
    on site_settings for all
    to authenticated
    using (true)
    with check (true);
