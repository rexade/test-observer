// lib/mirrorClient.ts
import type { RunListItem, RunDetail, RunMeta, Coverage, Decision } from "@/types/mirror";

const BASE = import.meta.env.VITE_MIRROR_API ?? "http://localhost:3000/api";
const AUTH = import.meta.env.VITE_MIRROR_TOKEN;

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const text = await r.text().catch(() => r.statusText);
    throw new Error(`${r.status} ${text}`);
  }
  return r.json() as Promise<T>;
}

const H = () => ({
  ...(AUTH ? { Authorization: `Bearer ${AUTH}` } : {}),
});

export async function listRuns(project?: string, limit = 20): Promise<RunListItem[]> {
  const u = new URL(`${BASE}/runs`);
  if (project) u.searchParams.set("project", project);
  u.searchParams.set("limit", String(limit));
  return j<RunListItem[]>(await fetch(u, { headers: H(), cache: "no-store" }));
}

export async function getRun(runId: string): Promise<RunDetail> {
  return j<RunDetail>(await fetch(`${BASE}/runs/${runId}`, { headers: H(), cache: "no-store" }));
}

export async function getDecisions(runId: string): Promise<Decision[]> {
  return j<Decision[]>(await fetch(`${BASE}/runs/${runId}/decisions`, { headers: H(), cache: "no-store" }));
}

// For local dev: post a run (same shape as the POST /api/runs)
export async function postRun(payload: {
  run: RunMeta;
  manifest: RunDetail["manifest"];
  coverage: Coverage;
  decisions: Decision[];
}): Promise<{ run_id: string; dashboard_url?: string }> {
  return j(await fetch(`${BASE}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...H(), "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify(payload),
  }));
}
