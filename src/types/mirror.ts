// Core API types matching the Reactive Mirror API contract

export type Coverage = {
  requirement: number;
  temporal: number;
  interface: number;
  risk: number;
  by_requirement?: { id: string; result: "pass" | "fail" | "unknown" }[];
};

export type Decision = {
  oracle: string;
  result: "pass" | "fail" | "skip" | "error";
  satisfies?: string[];
  evidence?: string[];
  message?: string;
};

export type RunMeta = {
  run_id: string;
  project: string;
  commit: string;
  branch: string;
  ci?: {
    provider?: string;
    workflow?: string;
    run_url?: string;
  };
  created_at: string;
};

export type RunManifest = {
  schema: "mirror.run-manifest.v1";
  decisions_ref?: string;
  counts: {
    events: number;
  };
  artifacts?: {
    path: string;
    sha256: string;
  }[];
  tooling?: {
    evaluator?: string;
    plugin?: string;
  };
};

export type ModuleCoverage = {
  run_id: number;
  module: string;
  interface: string;
  total_reqs: number;
  covered_reqs: number;
  covered_weight: number;
  total_weight: number;
  coverage: number;
  risk_weighted: number;
};

export type RunDetail = {
  run: RunMeta;
  manifest: RunManifest;
  coverage: Coverage;
  decisions: Decision[];
  moduleCoverage?: ModuleCoverage[];
};

export type RunCreate = {
  run: RunMeta;
  manifest: RunManifest;
  coverage: Coverage;
  decisions: Decision[];
};

export type RunListItem = RunMeta & {
  coverage: Coverage;
};

export type ApiRunCreateResponse = {
  run_id: string;
  dashboard_url: string;
  received: {
    events: number;
    decisions: number;
    artifacts_hashed: number;
  };
};
