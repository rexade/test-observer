// lib/mirrorClient.ts
import { supabase } from "@/integrations/supabase/client";
import type { RunListItem, RunDetail, RunMeta, Coverage, Decision } from "@/types/mirror";

export async function listRuns(project?: string, limit = 20): Promise<RunListItem[]> {
  const queryParams = new URLSearchParams({ 
    page: '1',
    pageSize: String(limit)
  });
  if (project) queryParams.set('project', project);

  const { data, error } = await supabase.functions.invoke(`runs?${queryParams.toString()}`, {
    method: 'GET'
  });

  if (error) throw new Error(error.message);
  // Handle paginated response
  return (data?.items ?? data) as RunListItem[];
}

export async function getRun(runId: string): Promise<RunDetail> {
  const { data, error } = await supabase.functions.invoke(`run-detail/${runId}`, {
    method: 'GET'
  });

  if (error) throw new Error(error.message);
  return data as RunDetail;
}

export async function getDecisions(runId: string): Promise<Decision[]> {
  const { data, error } = await supabase.functions.invoke(`run-decisions/${runId}`, {
    method: 'GET'
  });

  if (error) throw new Error(error.message);
  return data as Decision[];
}

// For local dev: post a run (same shape as the POST /api/runs)
export async function postRun(payload: {
  run: RunMeta;
  manifest: RunDetail["manifest"];
  coverage: Coverage;
  decisions: Decision[];
}): Promise<{ run_id: string; dashboard_url?: string }> {
  const { data, error } = await supabase.functions.invoke('runs', {
    method: 'POST',
    body: payload,
    headers: {
      "Idempotency-Key": crypto.randomUUID()
    }
  });

  if (error) throw new Error(error.message);
  return data as { run_id: string; dashboard_url?: string };
}
