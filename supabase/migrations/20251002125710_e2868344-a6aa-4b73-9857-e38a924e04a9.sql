-- Fix function with stable search_path
create or replace function public.sync_decisions_count()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.runs r
  set decisions_count = (select count(*) from public.decisions d where d.run_id = r.id)
  where r.id = coalesce(new.run_id, old.run_id);
  return null;
end $$;