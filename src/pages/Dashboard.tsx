import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock, TrendingUp, GitBranch, Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { RunListItem } from "@/types/mirror";
import { pct, formatTimeAgo, statusFromCoverage } from "@/lib/mirrorUi";
import { listRuns } from "@/lib/mirrorClient";

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch runs from API with React Query
  const { data: runs, isLoading, error } = useQuery<RunListItem[]>({
    queryKey: ["runs"],
    queryFn: () => listRuns(undefined, 20),
    refetchInterval: 30000, // Refresh every 30s
  });

  // Calculate aggregate metrics from runs
  const latestRun = runs?.[0];
  const avgRequirement = runs?.length
    ? runs.reduce((sum, r) => sum + r.coverage.requirement, 0) / runs.length
    : 0;
  const avgTemporal = runs?.length
    ? runs.reduce((sum, r) => sum + r.coverage.temporal, 0) / runs.length
    : 0;
  const totalRuns = runs?.length || 0;
  const passedRuns = runs?.filter(r => statusFromCoverage(r.coverage) === "passed").length || 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Test Coverage Dashboard</h1>
          <p className="text-muted-foreground">Real-time metrics from your pytest event stream</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Requirement Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-success">{pct(latestRun?.coverage.requirement)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Avg: {pct(avgRequirement)}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Temporal Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary">{pct(latestRun?.coverage.temporal)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Avg: {pct(avgTemporal)}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{totalRuns > 0 ? pct(passedRuns / totalRuns) : "—"}</div>
                  <p className="text-xs text-muted-foreground mt-1">{passedRuns} of {totalRuns} passed</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-accent">{totalRuns}</div>
                  <p className="text-xs text-muted-foreground mt-1">All signed & verified</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Runs */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Test Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load runs: {error instanceof Error ? error.message : "Unknown error"}
                </AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : !runs || runs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No test runs yet</p>
                <p className="text-sm mt-2">Upload your first run to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {runs.map((run) => {
                  const status = statusFromCoverage(run.coverage);
                  return (
                    <div
                      key={run.run_id}
                      onClick={() => navigate(`/runs/${run.run_id}`)}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {status === "passed" ? (
                          <CheckCircle2 className="h-8 w-8 text-success" />
                        ) : (
                          <XCircle className="h-8 w-8 text-destructive" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{run.branch}</span>
                            <Badge variant="outline" className="text-xs">{run.commit}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatTimeAgo(run.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pct(run.coverage.requirement)}</p>
                          <p className="text-xs text-muted-foreground">Requirement</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pct(run.coverage.temporal)}</p>
                          <p className="text-xs text-muted-foreground">Temporal</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Interface {pct(run.coverage.interface)}
                        </Badge>
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coverage Trends */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Coverage Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Interactive coverage chart would appear here</p>
                <p className="text-sm mt-2">Showing requirement, temporal, and interface coverage over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
