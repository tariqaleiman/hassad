"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ownerService } from "@/lib/services/owner-service";
import type { OwnerProfile } from "@/lib/types/owner";

const OWNER_KEY = ["ownerProfile"] as const;

export function useOwnerProfile() {
  return useQuery({
    queryKey: OWNER_KEY,
    queryFn: () => ownerService.get(),
  });
}

export function useSaveOwnerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: OwnerProfile) => ownerService.save(profile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEY });
      toast.success("تم حفظ بيانات المالك");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });
}
