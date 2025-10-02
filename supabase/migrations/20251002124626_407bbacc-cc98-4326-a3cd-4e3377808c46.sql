-- Create projects table
create table if not exists public.projects (
  id bigserial primary key,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Create runs table
create table if not exists public.runs (
  id bigserial primary key,
  run_id text unique not null,
  project_id bigint not null references public.projects(id) on delete cascade,
  commit text not null,
  branch text not null,
  created_at timestamptz not null,
  ci jsonb,
  manifest jsonb not null,
  coverage jsonb not null,
  signature jsonb,
  decisions_count int default 0
);

-- Create decisions table
create table if not exists public.decisions (
  id bigserial primary key,
  run_id bigint not null references public.runs(id) on delete cascade,
  oracle text not null,
  result text not null check (result in ('pass','fail')),
  satisfies text[] default '{}',
  evidence text[] default '{}',
  message text
);

-- Create indexes
create index if not exists idx_runs_project_created on public.runs(project_id, created_at desc);
create index if not exists idx_decisions_run on public.decisions(run_id);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.runs enable row level security;
alter table public.decisions enable row level security;

-- Public read access policies (for dashboard viewing)
create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Runs are viewable by everyone"
  on public.runs for select
  using (true);

create policy "Decisions are viewable by everyone"
  on public.decisions for select
  using (true);