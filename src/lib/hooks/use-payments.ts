"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { paymentService } from "@/lib/services/payment-service";

const PAYMENTS_KEY = ["payments"] as const;

export function usePayments() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...PAYMENTS_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return paymentService.getPaymentsByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
