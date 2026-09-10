create type user_role as enum ('student', 'industry', 'institution');

create table profiles (
  id uuid references auth.users primary key,
  role user_role not null,
  full_name text,
  org_name text,
  created_at timestamptz default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text
);

create table skill_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  responses jsonb,
  skill_profile jsonb,
  gap_analysis jsonb,
  created_at timestamptz default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid references profiles(id),
  type text check (type in ('internship','job','course','workshop')),
  title text not null,
  description text,
  required_skills jsonb,
  deadline date,
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  opportunity_id uuid references opportunities(id),
  status text default 'applied' check (status in ('applied','shortlisted','selected','rejected')),
  match_score numeric,
  applied_at timestamptz default now()
);

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  type text check (type in ('certificate','project','achievement','internship')),
  title text,
  description text,
  file_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table skill_assessments enable row level security;
alter table opportunities enable row level security;
alter table applications enable row level security;
alter table portfolio_items enable row level security;

create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "student manages own assessment" on skill_assessments
  for all using (auth.uid() = student_id);

create policy "read opportunities" on opportunities for select using (true);
create policy "industry creates opportunities" on opportunities
  for insert with check (auth.uid() = industry_id);
create policy "industry updates own opportunities" on opportunities
  for update using (auth.uid() = industry_id);

create policy "student manages own applications" on applications
  for all using (auth.uid() = student_id);
create policy "industry reads applicants" on applications for select
  using (exists (select 1 from opportunities o where o.id = opportunity_id and o.industry_id = auth.uid()));

create policy "student manages own portfolio" on portfolio_items
  for all using (auth.uid() = student_id);
