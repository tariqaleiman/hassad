"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { farmingOperationService } from "@/lib/services/farming-operation-service";
import { purchaseService } from "@/lib/services/purchase-service";
import { salesService } from "@/lib/services/sales-service";
import { cropCycleService } from "@/lib/services/crop-cycle-service";

export function useDashboardData() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: ["dashboard-data", user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return null;

      const [operations, purchases, sales, cropCycles] = await Promise.all([
        farmingOperationService.listOperationsByFarm(activeFarm.id),
        purchaseService.getInvoicesByFarm(activeFarm.id),
        salesService.getInvoicesByFarm(activeFarm.id),
        cropCycleService.listByFarm(activeFarm.id)
      ]);

      const totalOperationsCost = operations.reduce((sum, op) => sum + (op.totalCost || 0), 0);
      const totalPurchasesCost = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const totalExpenses = totalOperationsCost + totalPurchasesCost;

      const totalRevenues = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      // Latest 5 operations
      const latestOperations = [...operations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      return {
        totalExpenses,
        totalRevenues,
        cropCyclesCount: cropCycles.length,
        latestOperations,
      };
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
