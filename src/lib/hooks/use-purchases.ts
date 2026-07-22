"use client";

import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "@/lib/services/purchase-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";

const PURCHASES_KEY = ["purchases"] as const;

export function usePurchases() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...PURCHASES_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return purchaseService.getInvoicesByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
