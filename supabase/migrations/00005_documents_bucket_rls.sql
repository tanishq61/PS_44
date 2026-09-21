-- Create the 'documents' bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Set up security policies for the documents bucket
-- Allow authenticated users to upload their own documents
create policy "Users can upload their own documents."
  on storage.objects for insert
  with check ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to read their own documents
create policy "Users can read their own documents."
  on storage.objects for select
  using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to update their own documents
create policy "Users can update their own documents."
  on storage.objects for update
  using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to delete their own documents
create policy "Users can delete their own documents."
  on storage.objects for delete
  using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );
