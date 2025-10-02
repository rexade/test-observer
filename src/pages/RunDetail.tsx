import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, GitBranch, Shield, Clock, ExternalLink } from "lucide-react";
import { getRun, getDecisions } from "@/lib/mirrorClient";
import { pct, formatTimeAgo, statusFromCoverage } from "@/lib/mirrorUi";
import type { RunDetail as RunDetailType, Decision } from "@/types/mirror";
import DecisionsTable from "@/components/DecisionsTable";
import ManifestSummary from "@/components/ManifestSummary";

const RunDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: run, isLoading: runLoading, error: runError } = useQuery<RunDetailType>({
    queryKey: ["run", id],
    queryFn: () => getRun(id!),
    enabled: !!id,
  });

  const { data: decisions = [], isLoading: decisionsLoading } = useQuery<Decision[]>({
    queryKey: ["decisions", id],
    queryFn: () => getDecisions(id!),
    enabled: !!id,
  });

  const loading = runLoading || decisionsLoading;
  const error = runError;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Card className="shadow-card border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Run Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : error || "This run doesn't exist or couldn't be loaded."}
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const status = statusFromCoverage(run.coverage);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Run Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            {status === "passed" ? (
              <CheckCircle2 className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
            <div>
              <h1 className="text-4xl font-bold">{run.run.project}</h1>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="font-mono">{run.run.branch}</span>
                </div>
                <Badge variant="outline" className="font-mono">{run.run.commit}</Badge>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(run.run.created_at)}</span>
                </div>
                {run.run.ci?.run_url && (
                  <a 
                    href={run.run.ci.run_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View in {run.run.ci.provider || 'CI'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Requirement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{pct(run.coverage.requirement)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{pct(run.coverage.temporal)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pct(run.coverage.interface)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk-Weighted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{pct(run.coverage.risk)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Manifest Info */}
        <div className="mb-8">
          <ManifestSummary 
            manifest={run.manifest}
            counts={run.manifest.counts}
            tooling={run.manifest.tooling}
          />
        </div>

        {/* Decisions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Oracle Decisions ({decisions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DecisionsTable decisions={decisions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RunDetail;
