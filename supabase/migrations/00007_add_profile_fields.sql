-- Add website and updated_at to profiles
alter table profiles 
add column if not exists website text,
add column if not exists updated_at timestamptz default now();
