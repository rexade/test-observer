import type { Decision } from "@/types/mirror";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DecisionsTable({ decisions }: { decisions: Decision[] }) {
  if (!decisions?.length) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
        No decisions recorded
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Oracle</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Requirements</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((d, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{d.oracle}</TableCell>
              <TableCell>
                <Badge 
                  variant={d.result === "pass" ? "default" : "destructive"}
                  className="capitalize"
                >
                  {d.result}
                </Badge>
              </TableCell>
              <TableCell>
                {d.satisfies && d.satisfies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {d.satisfies.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="max-w-md">
                {d.message || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="max-w-xs">
                {d.evidence && d.evidence.length > 0 ? (
                  <div className="text-xs text-muted-foreground">
                    {d.evidence.join(", ")}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
