-- Replace security definer view with regular view
drop view if exists public.public_runs;

create view public.public_runs 
with (security_invoker = true)
as
select 
  r.run_id, 
  p.slug as project, 
  r.commit, 
  r.branch, 
  r.created_at, 
  r.ci, 
  r.coverage,
  r.decisions_count
from public.runs r
join public.projects p on p.id = r.project_id;