"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { farmingOperationService } from "@/lib/services/farming-operation-service";

const OPERATIONS_KEY = ["farmingOperations"] as const;

export function useOperations() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...OPERATIONS_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return farmingOperationService.listOperationsByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
