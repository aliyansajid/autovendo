interface KeyDetailCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export function KeyDetailCard({ label, value, icon }: KeyDetailCardProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0 flex items-center justify-center">{icon}</div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">
          {label}
        </p>
        <p className="font-semibold text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
