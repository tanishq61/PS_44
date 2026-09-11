-- Allow anyone to read profiles (needed so students can see company names and companies can see student names)
create policy "allow public read on profiles" on profiles for select using (true);

-- Also allow companies to read student portfolio items
create policy "allow public read on portfolio_items" on portfolio_items for select using (true);
