-- Allow companies and users to view candidate skill assessment profiles
drop policy if exists "allow public read on skill_assessments" on skill_assessments;
create policy "allow public read on skill_assessments" on skill_assessments for select using (true);
