"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { contractorService } from "@/lib/services/contractor-service";
import { ContractorList } from "@/components/contractors/contractor-list";
import type { Contractor } from "@/lib/types/contractor";

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
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (activeFarms.length === 0) {
    return (
      <div className="p-6 text-center text-ink-muted">
        يرجى إضافة مزرعة أولاً للوصول إلى المقاولين.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
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
