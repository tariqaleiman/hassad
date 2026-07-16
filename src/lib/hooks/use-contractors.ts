"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { useFarms } from "./use-farms";
import { contractorService } from "@/lib/services/contractor-service";

const CONTRACTORS_KEY = ["contractors"] as const;

export function useContractors() {
  const { user } = useAuth();
  const { data: farms } = useFarms();
  const activeFarm = farms?.[0];

  return useQuery({
    queryKey: [...CONTRACTORS_KEY, user?.uid, activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return [];
      return contractorService.getContractorsByFarm(activeFarm.id);
    },
    enabled: !!user?.uid && !!activeFarm?.id,
  });
}
