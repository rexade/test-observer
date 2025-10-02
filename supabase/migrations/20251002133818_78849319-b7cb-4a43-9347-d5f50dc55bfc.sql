-- Create requirements registry table
CREATE TABLE IF NOT EXISTS public.requirements (
  id bigserial PRIMARY KEY,
  project_id bigint NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  req_id text NOT NULL,
  title text,
  description text,
  risk_level text CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (project_id, req_id)
);

-- Enable RLS
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "public read requirements"
ON public.requirements
FOR SELECT
USING (true);

-- Index for fast lookups
CREATE INDEX idx_requirements_project_req ON public.requirements(project_id, req_id);

-- Add requirements_coverage jsonb column to runs table for detailed requirement tracking
ALTER TABLE public.runs 
ADD COLUMN IF NOT EXISTS requirements_coverage jsonb DEFAULT '{}'::jsonb;