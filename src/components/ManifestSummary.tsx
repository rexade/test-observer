import { Card } from "@/components/ui/card";

interface ManifestSummaryProps {
  manifest: any;
  counts?: { events: number };
  tooling?: Record<string, string>;
}

export default function ManifestSummary({ manifest, counts, tooling }: ManifestSummaryProps) {
  // Handle different artifact field names (artifacts vs files)
  const artifacts = Array.isArray(manifest?.artifacts)
    ? manifest.artifacts
    : Array.isArray(manifest?.files)
      ? manifest.files
      : [];
  const artifactCount = artifacts.length ?? 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Manifest Summary</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Schema</div>
          <div className="font-medium">{manifest?.schema ?? "—"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Events</div>
          <div className="font-medium">
            {counts?.events?.toLocaleString?.() ?? "—"}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Artifacts</div>
          <div className="font-medium">
            {artifactCount}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Decisions Reference</div>
          <div className="font-medium text-xs break-all">
            {manifest?.decisions_ref ?? "—"}
          </div>
        </div>
      </div>
      
      {tooling && Object.keys(tooling).length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="text-sm text-muted-foreground mb-2">Tooling</div>
          <div className="grid gap-2">
            {Object.entries(tooling).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm">
                <span className="text-muted-foreground capitalize">{k}:</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
