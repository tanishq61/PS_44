-- Add resume_url to profiles
alter table profiles add column if not exists resume_url text;

-- Insert the 'resumes' bucket into the storage.buckets table
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Set up security policies for the resumes bucket
-- Allow public access for reading resumes
create policy "Resumes are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'resumes' );

-- Allow authenticated students to upload their own resumes
create policy "Users can upload their own resumes."
  on storage.objects for insert
  with check ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own resumes."
  on storage.objects for update
  using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own resumes."
  on storage.objects for delete
  using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );
