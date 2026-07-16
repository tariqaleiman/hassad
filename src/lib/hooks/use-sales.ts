"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { salesService } from "@/lib/services/sales-service";

const SALES_KEY = ["salesInvoices"] as const;

export function useSales() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...SALES_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return salesService.getInvoicesByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
