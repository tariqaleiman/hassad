"use client";

import { useQuery } from "@tanstack/react-query";
import { supplierService } from "@/lib/services/supplier-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";

const SUPPLIERS_KEY = ["suppliers"] as const;

export function useSuppliers() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...SUPPLIERS_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return supplierService.getSuppliersByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
