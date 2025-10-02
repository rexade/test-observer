import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Network, Activity } from "lucide-react";

const Explorer = () => {
  const mockSystems = [
    { name: "auth-service", interfaces: 12, events: 284, health: "healthy" },
    { name: "payment-gateway", interfaces: 8, events: 156, health: "healthy" },
    { name: "notification-service", interfaces: 6, events: 432, health: "warning" },
  ];

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
            <div className="aspect-video bg-gradient-card rounded-xl flex items-center justify-center border border-border">
              <div className="text-center">
                <Network className="h-24 w-24 text-primary mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">Interactive System Map</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Visualize your event architecture: click systems to drill into interfaces, 
                  then events, with real-time coverage indicators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System List */}
        <div className="grid md:grid-cols-3 gap-6">
          {mockSystems.map((system) => (
            <Card key={system.name} className="shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <span className="font-mono text-sm">{system.name}</span>
                  </div>
                  <Badge 
                    variant={system.health === "healthy" ? "default" : "destructive"}
                    className={system.health === "healthy" ? "bg-success" : ""}
                  >
                    {system.health}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interfaces</span>
                    <span className="font-semibold">{system.interfaces}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Events Captured</span>
                    <span className="font-semibold">{system.events}</span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Activity className="h-4 w-4" />
                      <span>View Event Stream</span>
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

export default Explorer;
