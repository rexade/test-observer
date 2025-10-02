-- Recreate view with only safe columns and explicit security_invoker
drop view if exists public.public_runs;
create view public.public_runs as
select
  r.run_id,
  p.slug as project,
  r.commit,
  r.branch,
  r.created_at,
  r.ci,
  r.coverage
from public.runs r
join public.projects p on p.id = r.project_id;

alter view public.public_runs set (security_invoker = on);

-- Add coverage bounds constraint
alter table public.runs
  add constraint chk_coverage_bounds
  check (
    (coverage->>'requirement')::numeric between 0 and 1
    and (coverage->>'temporal')::numeric between 0 and 1
    and (coverage->>'interface')::numeric between 0 and 1
    and (coverage->>'risk')::numeric between 0 and 1
  );

-- Sync decisions_count with trigger
create or replace function public.sync_decisions_count()
returns trigger language plpgsql as $$
begin
  update public.runs r
  set decisions_count = (select count(*) from public.decisions d where d.run_id = r.id)
  where r.id = coalesce(new.run_id, old.run_id);
  return null;
end $$;

drop trigger if exists trg_sync_decisions_count on public.decisions;
create trigger trg_sync_decisions_count
after insert or delete or update on public.decisions
for each row execute function public.sync_decisions_count();