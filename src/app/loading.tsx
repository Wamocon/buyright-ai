import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}
