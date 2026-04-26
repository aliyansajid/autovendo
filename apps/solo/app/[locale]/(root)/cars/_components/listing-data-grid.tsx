interface DataGridProps {
  data: Record<string, string>;
}

export function ListingDataGrid({ data }: DataGridProps) {
  const entries = Object.entries(data);
  const rows = Array.from({ length: Math.ceil(entries.length / 2) }, (_, i) =>
    entries.slice(i * 2, i * 2 + 2),
  );

  if (!entries.length) return null;

  return (
    <div>
      {rows.map((row, rowIdx) => {
        const isLastRow = rowIdx === rows.length - 1;
        return (
          <div key={rowIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {row.map(([label, value]) => (
              <div
                key={label}
                className={`flex items-center justify-between py-3 ${!isLastRow ? "border-b" : ""}`}
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
