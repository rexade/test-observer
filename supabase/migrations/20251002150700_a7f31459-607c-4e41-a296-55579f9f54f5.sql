-- Fix security definer view issue by recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public_requirements_coverage;

CREATE OR REPLACE VIEW public_requirements_coverage 
WITH (security_invoker=true) AS
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