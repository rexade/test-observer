-- Add module/interface grouping to requirements
ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS module text,
  ADD COLUMN IF NOT EXISTS interface text,
  ADD COLUMN IF NOT EXISTS risk_weight real DEFAULT 1.0;

-- Per-run requirement verdicts
CREATE TABLE IF NOT EXISTS run_requirements (
  run_id bigint REFERENCES runs(id) ON DELETE CASCADE,
  requirement_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pass','fail','skip','unknown')),
  PRIMARY KEY (run_id, requirement_id)
);

-- Enable RLS
ALTER TABLE run_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read run_requirements"
  ON run_requirements FOR SELECT
  USING (true);

-- View for per-run, per-module coverage
CREATE OR REPLACE VIEW public_requirements_coverage AS
SELECT
  rr.run_id,
  req.module,
  req.interface,
  COUNT(*) AS total_reqs,
  COUNT(*) FILTER (WHERE rr.status='pass') AS covered_reqs,
  COALESCE(SUM(CASE WHEN rr.status='pass' THEN req.risk_weight ELSE 0 END), 0) AS covered_weight,
  COALESCE(SUM(req.risk_weight), 0) AS total_weight,
  CASE 
    WHEN COUNT(*) = 0 THEN 0 
    ELSE COUNT(*) FILTER (WHERE rr.status='pass')::float / COUNT(*) 
  END AS coverage,
  CASE 
    WHEN COALESCE(SUM(req.risk_weight), 0) = 0 THEN 0 
    ELSE COALESCE(SUM(CASE WHEN rr.status='pass' THEN req.risk_weight ELSE 0 END), 0)::float / COALESCE(SUM(req.risk_weight), 0) 
  END AS risk_weighted
FROM run_requirements rr
JOIN requirements req ON req.req_id = rr.requirement_id
GROUP BY rr.run_id, req.module, req.interface;