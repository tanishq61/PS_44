alter table opportunities drop constraint if exists opportunities_type_check;
alter table opportunities add constraint opportunities_type_check check (type in ('internship','job','course','workshop','fdp','research'));
