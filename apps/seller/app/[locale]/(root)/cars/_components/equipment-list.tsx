import { CheckCircle2 } from "lucide-react";

interface EquipmentListProps {
  items: string[];
}

export function EquipmentList({ items }: EquipmentListProps) {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="size-4 text-green-500 shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
