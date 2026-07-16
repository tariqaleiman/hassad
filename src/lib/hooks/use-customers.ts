"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { customerService } from "@/lib/services/customer-service";

const CUSTOMERS_KEY = ["customers"] as const;

export function useCustomers() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...CUSTOMERS_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return customerService.getCustomersByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
