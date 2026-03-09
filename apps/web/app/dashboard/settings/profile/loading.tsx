import { Spinner } from "@repo/ui/src/components/spinner";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading profile data...</p>
      </div>
    </div>
  );
}
