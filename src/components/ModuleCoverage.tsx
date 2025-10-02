import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { pct } from "@/lib/status";

type ModuleCoverageData = {
  module: string;
  interface: string;
  total_reqs: number;
  covered_reqs: number;
  coverage: number;
  risk_weighted: number;
};

export default function ModuleCoverage({ modules }: { modules: ModuleCoverageData[] }) {
  if (!modules || modules.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Coverage by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No module-level coverage data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Coverage by Module</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {modules.map((mod, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{mod.module}</span>
                <Badge variant="outline" className="text-xs">
                  {mod.interface}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {mod.covered_reqs}/{mod.total_reqs} reqs
                </span>
                <span className="font-semibold min-w-[3rem] text-right">
                  {pct(mod.coverage)}
                </span>
              </div>
            </div>
            <Progress value={mod.coverage * 100} className="h-2" />
            {mod.risk_weighted !== mod.coverage && (
              <div className="text-xs text-muted-foreground">
                Risk-weighted: {pct(mod.risk_weighted)}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
