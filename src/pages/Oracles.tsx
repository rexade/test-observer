import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle2 } from "lucide-react";

const Oracles = () => {
  const mockOracles = [
    {
      id: "oracle-1",
      requirement: "REQ-AUTH-001",
      name: "Login Success Rate",
      condition: "success_rate >= 0.99 AND cadence <= 1h",
      status: "passing",
      lastEval: "5 minutes ago"
    },
    {
      id: "oracle-2",
      requirement: "REQ-PERF-003",
      name: "Response Time SLA",
      condition: "p95_latency < 200ms AND uniqueness(session_id)",
      status: "passing",
      lastEval: "10 minutes ago"
    },
    {
      id: "oracle-3",
      requirement: "REQ-DATA-005",
      name: "Backup Freshness",
      condition: "now() - last_backup < 24h",
      status: "passing",
      lastEval: "1 hour ago"
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Oracle Definitions</h1>
          <p className="text-muted-foreground">Temporal conditions and requirements mapped to your test events</p>
        </div>

        {/* YAML Example */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>Example Oracle Definition (YAML)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
{`oracles:
  - requirement_id: REQ-AUTH-001
    name: "Login Success Rate"
    condition: |
      success_rate >= 0.99 AND 
      cadence(event_kind='login_attempt') <= duration('1h')
    
  - requirement_id: REQ-PERF-003
    name: "Response Time SLA"
    condition: |
      p95_latency < duration('200ms') AND
      uniqueness(field='session_id')
    
  - requirement_id: REQ-DATA-005
    name: "Backup Freshness"
    condition: "now() - last_backup < duration('24h')"`}
            </pre>
          </CardContent>
        </Card>

        {/* Active Oracles */}
        <div className="space-y-4">
          {mockOracles.map((oracle) => (
            <Card key={oracle.id} className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{oracle.name}</h3>
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {oracle.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Badge variant="outline" className="font-mono">
                        {oracle.requirement}
                      </Badge>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{oracle.lastEval}</span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <code className="text-sm font-mono text-foreground">{oracle.condition}</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Oracles;
