"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "@/lib/hooks/use-farms";
import { Spinner } from "@/components/ui/spinner";
import { FinanceHub } from "@/components/finance/finance-hub";
import { farmingOperationService } from "@/lib/services/farming-operation-service";
import { purchaseService } from "@/lib/services/purchase-service";
import { salesService } from "@/lib/services/sales-service";
import { customerService } from "@/lib/services/customer-service";
import { supplierService } from "@/lib/services/supplier-service";
import { contractorService } from "@/lib/services/contractor-service";
import { cropCycleService } from "@/lib/services/crop-cycle-service";
import { cropService } from "@/lib/services/crop-service";
import { seasonService } from "@/lib/services/season-service";
import { landService } from "@/lib/services/land-service";

export default function FinancePage() {
  const { user } = useAuth();
  const { data: activeFarms = [], isLoading: isLoadingFarms } = useFarms();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (activeFarms.length === 0 || !user) return;

    setLoading(true);
    try {
      const farmId = activeFarms[0].id; // We'll just use the first farm for now

      const [
        operations,
        purchases,
        sales,
        customers,
        suppliers,
        contractors,
        cropCycles,
        crops,
        seasons,
        lands
      ] = await Promise.all([
        farmingOperationService.listOperationsByFarm(farmId),
        purchaseService.getInvoicesByFarm(farmId),
        salesService.getInvoicesByFarm(farmId),
        customerService.getCustomersByFarm(farmId),
        supplierService.getSuppliersByFarm(farmId),
        contractorService.getContractorsByFarm(farmId),
        cropCycleService.listByFarm(farmId),
        cropService.list(user.uid),
        seasonService.listByFarm(farmId),
        landService.listByFarm(farmId)
      ]);

      setData({
        farmId,
        operations,
        purchases,
        sales,
        customers,
        suppliers,
        contractors,
        cropCycles,
        crops,
        seasons,
        lands
      });

    } catch (error) {
      console.error("Error loading finance data:", error);
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
        يرجى إضافة مزرعة أولاً للوصول إلى المركز المالي.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {loading || !data ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <FinanceHub 
          data={data} 
          userId={user?.uid || ""} 
          onUpdate={loadData} 
        />
      )}
    </div>
  );
}
