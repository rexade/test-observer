interface EvidenceProps {
  items?: string[];
}

export default function Evidence({ items }: EvidenceProps) {
  if (!items?.length) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((e, i) => {
        const isUrl = /^https?:\/\//i.test(e);
        return (
          <span key={i} className="text-xs">
            {isUrl ? (
              <a 
                href={e} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {e}
              </a>
            ) : (
              <span className="text-muted-foreground font-mono">{e}</span>
            )}
            {i < items.length - 1 && <span className="text-muted-foreground">, </span>}
          </span>
        );
      })}
    </div>
  );
}
