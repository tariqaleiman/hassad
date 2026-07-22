"use client";

import { useFarms } from "@/lib/hooks/use-farms";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { OperationsList } from "@/components/operations/operations-list";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function OperationsPage() {
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();

  if (isLoadingFarms) {
    return <PageSkeleton />;
  }

  if (activeFarms.length === 0) {
    return (
      <EmptyState icon={MapPin} title="لا توجد مزارع" description="يرجى إضافة مزرعة أولاً للوصول إلى هذا القسم." />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <OperationsList farms={activeFarms} />
    </div>
  );
}
