import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, GitBranch, Shield, Clock, FileCode } from "lucide-react";
import { getRun, getDecisions } from "@/lib/mirrorClient";
import { pct, formatTimeAgo, statusFromCoverage } from "@/lib/mirrorUi";
import type { RunDetail as RunDetailType, Decision } from "@/types/mirror";

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
              <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="font-mono">{run.run.branch}</span>
                </div>
                <Badge variant="outline" className="font-mono">{run.run.commit}</Badge>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(run.run.created_at)}</span>
                </div>
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
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Run Manifest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="text-2xl font-bold">{run.manifest.counts.events.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decisions</p>
                <p className="text-2xl font-bold">{decisions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Artifacts</p>
                <p className="text-2xl font-bold">{run.manifest.artifacts?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Schema</p>
                <p className="text-sm font-mono">{run.manifest.schema}</p>
              </div>
            </div>
            {run.manifest.tooling && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Tooling</p>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(run.manifest.tooling).map(([key, val]) => (
                    <Badge key={key} variant="secondary" className="font-mono">
                      {key}: {val}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decisions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Oracle Decisions ({decisions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No decisions recorded</p>
            ) : (
              <div className="space-y-4">
                {decisions.map((decision, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-muted/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {decision.result === "pass" ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="font-mono font-semibold">{decision.oracle}</span>
                      </div>
                      <Badge variant={decision.result === "pass" ? "default" : "destructive"}>
                        {decision.result}
                      </Badge>
                    </div>
                    {decision.message && (
                      <p className="text-sm text-muted-foreground mb-2">{decision.message}</p>
                    )}
                    {decision.satisfies && decision.satisfies.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-2">
                        {decision.satisfies.map((req) => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {decision.evidence && decision.evidence.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold">Evidence:</span>{" "}
                        {decision.evidence.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RunDetail;
