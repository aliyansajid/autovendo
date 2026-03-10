import { Skeleton } from "@repo/ui/src/components/skeleton";

export default function VehiclesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />

        <div className="rounded-md border">
          <div className="h-12 border-b bg-muted/50" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex h-16 items-center px-4 border-b last:border-0"
            >
              <Skeleton className="h-10 w-10 mr-4 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-20 mr-12" />
              <Skeleton className="h-4 w-24 mr-12" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
