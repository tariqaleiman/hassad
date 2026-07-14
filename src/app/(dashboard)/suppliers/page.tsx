"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { supplierService } from "@/lib/services/supplier-service";
import { SupplierList } from "@/components/purchases/supplier-list";
import type { Supplier } from "@/lib/types/supplier";

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
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (activeFarms.length === 0) {
    return (
      <div className="p-6 text-center text-ink-muted">
        يرجى إضافة مزرعة أولاً للوصول إلى الموردين.
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
