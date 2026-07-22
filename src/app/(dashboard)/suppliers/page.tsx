"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { supplierService } from "@/lib/services/supplier-service";
import { SupplierList } from "@/components/purchases/supplier-list";
import type { Supplier } from "@/lib/types/supplier";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function SuppliersPage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;
    
    setLoading(true);
    try {
      const allSuppliers: Supplier[] = [];
      for (const farm of activeFarms) {
        const farmSuppliers = await supplierService.getSuppliersByFarm(farm.id);
        allSuppliers.push(...farmSuppliers);
      }
      setSuppliers(allSuppliers);
    } catch (error) {
      console.error("Error loading suppliers:", error);
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
        <SupplierList
          farms={activeFarms}
          suppliers={suppliers}
          userId={user?.uid || ""}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
