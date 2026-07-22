import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function PageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full hidden sm:block" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border/50 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <Skeleton className="h-14 w-full rounded-xl" />

      {/* List */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-paper-raised/40 border border-border/50 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4 w-full">
                <Skeleton className="h-12 w-12 rounded-xl mt-1 shrink-0" />
                <div className="space-y-3 w-full max-w-md">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-6 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-r border-border/50 pt-4 md:pt-0 md:pr-6 w-full md:w-48">
                <div className="space-y-2 text-right">
                  <Skeleton className="h-3 w-16 ms-auto" />
                  <Skeleton className="h-6 w-24 ms-auto" />
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
