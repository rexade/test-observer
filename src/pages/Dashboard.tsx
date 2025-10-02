import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, TrendingUp, GitBranch, Shield } from "lucide-react";
import type { RunListItem } from "@/types/mirror";
import { pct, formatTimeAgo, statusFromCoverage } from "@/lib/mirrorUi";

const Dashboard = () => {
  // Mock data matching real API structure
  const mockRuns: RunListItem[] = [
    {
      run_id: "01HXYZ123456",
      project: "acme/vehicle-fw",
      branch: "main",
      commit: "a3f2c1d",
      created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
      ci: { provider: "github_actions", workflow: "tests" },
      coverage: { requirement: 0.94, temporal: 0.87, interface: 0.92, risk: 0.89 }
    },
    {
      run_id: "01HXYZ123457",
      project: "acme/vehicle-fw",
      branch: "feature/ntp",
      commit: "b7e9f3a",
      created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
      ci: { provider: "github_actions", workflow: "tests" },
      coverage: { requirement: 0.87, temporal: 0.61, interface: 0.75, risk: 0.83 }
    },
    {
      run_id: "01HXYZ123458",
      project: "acme/vehicle-fw",
      branch: "main",
      commit: "c2d4e5f",
      created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
      ci: { provider: "github_actions", workflow: "tests" },
      coverage: { requirement: 0.82, temporal: 0.55, interface: 0.68, risk: 0.76 }
    },
  ];

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
              <div className="text-3xl font-bold text-success">94%</div>
              <p className="text-xs text-muted-foreground mt-1">+3% from last week</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Temporal Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">87%</div>
              <p className="text-xs text-muted-foreground mt-1">Cadence checks passing</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Oracles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">142</div>
              <p className="text-xs text-muted-foreground mt-1">12 added this week</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Signed Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">328</div>
              <p className="text-xs text-muted-foreground mt-1">All verified ✓</p>
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
            <div className="space-y-4">
              {mockRuns.map((run) => {
                const status = statusFromCoverage(run.coverage);
                return (
                  <div key={run.run_id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
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
