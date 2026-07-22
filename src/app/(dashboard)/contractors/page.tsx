"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { contractorService } from "@/lib/services/contractor-service";
import { ContractorList } from "@/components/contractors/contractor-list";
import type { Contractor } from "@/lib/types/contractor";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function ContractorsPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;

    setLoading(true);
    try {
      const allContractors: Contractor[] = [];
      for (const farm of activeFarms) {
        const farmContractors = await contractorService.getContractorsByFarm(farm.id);
        allContractors.push(...farmContractors);
      }
      setContractors(allContractors);
    } catch (error) {
      console.error("Error loading contractors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFarms, user]);

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
      {loading ? (
        <PageSkeleton />
      ) : (
        <ContractorList
          contractors={contractors}
          farms={activeFarms}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
