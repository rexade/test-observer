// Configurable thresholds
export const REQ_THRESHOLD = Number(import.meta.env.VITE_REQ_THRESHOLD ?? '0.85');
export const TMP_THRESHOLD = Number(import.meta.env.VITE_TMP_THRESHOLD ?? '0.35');

export function statusFromCoverage(q: { requirement?: number; temporal?: number } = {}) {
  const req = q.requirement ?? 0;
  const tmp = q.temporal ?? 0;
  return req >= REQ_THRESHOLD && tmp >= TMP_THRESHOLD;
}

// Truth from pytest results
export function testsPassed(run: {
  pass_rate?: number; 
  passed?: number; 
  total?: number; 
  status?: string; 
  decisions?: any[];
  coverage?: { requirement?: number };
}) {
  // If pass_rate exists, use it
  if (typeof run.pass_rate === 'number') return run.pass_rate >= 1;
  
  // If passed/total counts exist
  if (typeof run.passed === 'number' && typeof run.total === 'number') {
    return run.passed === run.total;
  }
  
  // Check decisions array
  if (Array.isArray(run.decisions) && run.decisions.length) {
    return run.decisions.every(d => 
      String(d.result ?? d.status ?? '').toLowerCase() === 'pass'
    );
  }
  
  // Fallback to status field
  if (typeof run.status === 'string') {
    return run.status.toLowerCase() === 'passed';
  }
  
  // Last resort: if requirement coverage is 1.0 (100%), tests likely passed
  if (run.coverage?.requirement === 1) return true;
  
  return false;
}

// What the big icon should show
export function runStatus(run: any) {
  return testsPassed(run) ? 'passed' : 'failed';
}

export const pct = (v?: number) =>
  Number.isFinite(v) ? `${Math.round((v as number) * 100)}%` : "—";

export const formatTimeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};
