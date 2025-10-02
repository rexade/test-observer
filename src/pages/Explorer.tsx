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
              <div className="aspect-video bg-gradient-card rounded-xl border border-border p-6">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="400" fill="url(#grid)" />
                  
                  {/* Central hub */}
                  <circle cx="400" cy="200" r="30" fill="hsl(var(--primary))" opacity="0.2" />
                  <circle cx="400" cy="200" r="20" fill="hsl(var(--primary))" opacity="0.6" />
                  <text x="400" y="205" textAnchor="middle" className="text-xs font-semibold" fill="hsl(var(--primary-foreground))">CI</text>
                  
                  {/* Test systems as nodes */}
                  {systems.map((system, idx) => {
                    const angle = (idx * 2 * Math.PI) / Math.max(systems.length, 3);
                    const radius = 140;
                    const x = 400 + radius * Math.cos(angle);
                    const y = 200 + radius * Math.sin(angle);
                    const isHealthy = system.tests >= 80;
                    
                    return (
                      <g key={system.name}>
                        {/* Connection line */}
                        <line 
                          x1="400" y1="200" x2={x} y2={y} 
                          stroke={isHealthy ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                          strokeWidth="2" 
                          opacity="0.3"
                          strokeDasharray={isHealthy ? "0" : "5,5"}
                        />
                        
                        {/* System node */}
                        <circle 
                          cx={x} cy={y} r="35" 
                          fill={isHealthy ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                          opacity="0.2"
                          className="transition-all hover:opacity-40 cursor-pointer"
                        />
                        <circle 
                          cx={x} cy={y} r="25" 
                          fill={isHealthy ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                          opacity="0.6"
                          className="transition-all hover:opacity-80 cursor-pointer"
                        />
                        
                        {/* Coverage percentage */}
                        <text 
                          x={x} y={y} 
                          textAnchor="middle" 
                          className="text-sm font-bold" 
                          fill="white"
                        >
                          {system.tests}%
                        </text>
                        
                        {/* System name */}
                        <text 
                          x={x} y={y + 50} 
                          textAnchor="middle" 
                          className="text-xs font-mono" 
                          fill="hsl(var(--foreground))"
                        >
                          {system.name.split('/').pop()?.slice(0, 15) || 'unknown'}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Legend */}
                  <g transform="translate(20, 20)">
                    <circle cx="5" cy="5" r="5" fill="hsl(var(--success))" opacity="0.6" />
                    <text x="15" y="9" className="text-xs" fill="hsl(var(--muted-foreground))">Healthy (≥80%)</text>
                    
                    <circle cx="5" cy="25" r="5" fill="hsl(var(--destructive))" opacity="0.6" />
                    <text x="15" y="29" className="text-xs" fill="hsl(var(--muted-foreground))">Warning (&lt;80%)</text>
                  </g>
                </svg>
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
