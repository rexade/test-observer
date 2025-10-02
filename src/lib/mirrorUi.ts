// lib/mirrorUi.ts
import type { Coverage } from "@/types/mirror";

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

export const statusFromCoverage = (c: Coverage) =>
  c && c.requirement >= 0.85 && c.temporal >= 0.6 ? "passed" : "failed";
