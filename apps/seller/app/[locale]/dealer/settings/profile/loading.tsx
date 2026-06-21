import { Skeleton } from "@repo/ui/components/skeleton";
import { Card, CardHeader, CardContent } from "@repo/ui/components/card";

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <FieldSkeleton key={i} />
            ))}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Company info */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <FieldSkeleton key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldSkeleton />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-32 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <FieldSkeleton key={i} />
              ))}
            </div>
            <FieldSkeleton />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldSkeleton />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <FieldSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opening hours */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
