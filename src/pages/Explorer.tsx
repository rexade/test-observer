import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layers, Network, Activity, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listRuns } from "@/lib/mirrorClient";

const Explorer = () => {
  const { data: runsData, isLoading, error } = useQuery({
    queryKey: ["runs-explorer"],
    queryFn: () => listRuns(undefined, 20),
  });

  const runs = Array.isArray(runsData) ? runsData : ((runsData as any)?.items || []);
  
  // Extract unique test modules as "systems"
  const systems = runs.length > 0 ? (() => {
    const moduleMap = new Map<string, { name: string; tests: number; lastRun: string }>();
    
    runs.forEach(run => {
      const module = run.project || "unknown";
      const existing = moduleMap.get(module);
      if (!existing || run.created_at > existing.lastRun) {
        moduleMap.set(module, {
          name: module,
          tests: run.coverage?.requirement ? Math.round(run.coverage.requirement * 100) : 0,
          lastRun: run.created_at
        });
      }
    });
    
    return Array.from(moduleMap.values());
  })() : [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Event Explorer</h1>
          <p className="text-muted-foreground">Navigate your system like Google Maps: zoom from systems → interfaces → events</p>
        </div>

        {/* Interactive Map Placeholder */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load test data: {error instanceof Error ? error.message : "Unknown error"}
                </AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="aspect-video bg-gradient-card rounded-xl flex items-center justify-center border border-border">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            ) : runs.length === 0 ? (
              <div className="aspect-video bg-gradient-card rounded-xl flex items-center justify-center border border-border">
                <div className="text-center">
                  <Network className="h-24 w-24 text-primary mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">No test data yet</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Upload your first test run to see the interactive system map
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-card rounded-xl flex items-center justify-center border border-border">
                <div className="text-center">
                  <Network className="h-24 w-24 text-primary mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">Interactive System Map</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {runs.length} test run{runs.length === 1 ? '' : 's'} loaded • Visualize your event architecture
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System List */}
        {!isLoading && !error && systems.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {systems.map((system) => (
              <Card key={system.name} className="shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <span className="font-mono text-sm truncate">{system.name}</span>
                    </div>
                    <Badge 
                      variant={system.tests >= 80 ? "default" : "destructive"}
                      className={system.tests >= 80 ? "bg-success" : ""}
                    >
                      {system.tests >= 80 ? "healthy" : "warning"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Test Coverage</span>
                      <span className="font-semibold">{system.tests}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Run</span>
                      <span className="font-semibold text-xs">{new Date(system.lastRun).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Activity className="h-4 w-4" />
                        <span>View Test Results</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explorer;
