-- Drop existing constraints to rebuild with stricter rules
alter table if exists decisions drop constraint if exists decisions_result_check;
alter table if exists decisions drop constraint if exists decisions_run_id_fkey;
alter table if exists runs drop constraint if exists runs_project_id_fkey;

-- Drop and recreate tables with strict constraints
drop table if exists decisions cascade;
drop table if exists runs cascade;
drop table if exists projects cascade;

-- Projects table with strict constraints
create table public.projects (
  id bigserial primary key,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Runs table with proper defaults and constraints
create table public.runs (
  id bigserial primary key,
  run_id text not null unique,
  project_id bigint not null references public.projects(id) on delete cascade,
  commit text,
  branch text,
  created_at timestamptz not null,
  ci jsonb not null default '{}',
  manifest jsonb,
  coverage jsonb,
  decisions_count integer not null default 0
);

-- Decisions table with extended result types
create table public.decisions (
  id bigserial primary key,
  run_id bigint not null references public.runs(id) on delete cascade,
  oracle text not null,
  result text not null check (result in ('pass','fail','skip','error')),
  satisfies text[] not null default '{}',
  evidence text[] not null default '{}',
  message text
);

-- Idempotency: prevent duplicate decisions per run+oracle
create unique index ux_decisions_run_oracle on public.decisions(run_id, oracle);

-- Performance indexes
create index ix_runs_project_created on public.runs(project_id, created_at desc);
create index ix_projects_slug on public.projects(lower(slug));

-- Enable RLS
alter table public.projects enable row level security;
alter table public.runs enable row level security;
alter table public.decisions enable row level security;

-- Public read policies
create policy "public read projects" on public.projects
  for select using (true);

create policy "public read runs" on public.runs
  for select using (true);

create policy "public read decisions" on public.decisions
  for select using (true);

-- Read-optimized view
create or replace view public.public_runs as
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