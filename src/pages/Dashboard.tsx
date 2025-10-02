import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, TrendingUp, GitBranch, Shield } from "lucide-react";

const Dashboard = () => {
  const mockRuns = [
    { id: "run-1", branch: "main", commit: "a3f2c1d", timestamp: "2 hours ago", status: "passed", coverage: 94 },
    { id: "run-2", branch: "feature/auth", commit: "b7e9f3a", timestamp: "5 hours ago", status: "passed", coverage: 87 },
    { id: "run-3", branch: "main", commit: "c2d4e5f", timestamp: "1 day ago", status: "failed", coverage: 82 },
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
              {mockRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {run.status === "passed" ? (
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
                      <p className="text-sm text-muted-foreground">{run.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{run.coverage}%</p>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                    </div>
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                </div>
              ))}
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
