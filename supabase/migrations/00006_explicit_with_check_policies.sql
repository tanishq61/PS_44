-- Add explicit WITH CHECK clauses to ensure users can only insert rows belonging to them
-- and update rows where they retain ownership.

-- For portfolio_items
drop policy if exists "Users can create their own portfolio items" on portfolio_items;
create policy "Users can create their own portfolio items" 
  on portfolio_items for insert 
  with check (auth.uid() = student_id);

drop policy if exists "Users can update their own portfolio items" on portfolio_items;
create policy "Users can update their own portfolio items" 
  on portfolio_items for update 
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- For applications
drop policy if exists "Students can create applications" on applications;
create policy "Students can create applications" 
  on applications for insert 
  with check (auth.uid() = student_id);

drop policy if exists "Students can update their own applications" on applications;
create policy "Students can update their own applications" 
  on applications for update 
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- For skill_assessments
drop policy if exists "Users can insert their own assessments" on skill_assessments;
create policy "Users can insert their own assessments" 
  on skill_assessments for insert 
  with check (auth.uid() = student_id);

drop policy if exists "Users can update their own assessments" on skill_assessments;
create policy "Users can update their own assessments" 
  on skill_assessments for update 
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);
