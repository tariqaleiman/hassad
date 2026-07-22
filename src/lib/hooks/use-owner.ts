"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ownerService } from "@/lib/services/owner-service";
import type { OwnerProfile } from "@/lib/types/owner";
import { useAuth } from "@/lib/providers/auth-provider";

const OWNER_KEY = ["ownerProfile"] as const;

export function useOwnerProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...OWNER_KEY, user?.uid],
    queryFn: () => ownerService.get(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useSaveOwnerProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const ownerUid = user?.uid || "local_owner";
  return useMutation({
    mutationFn: (profile: OwnerProfile) => {
      return ownerService.save(profile, ownerUid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...OWNER_KEY, ownerUid] });
      toast.success("تم حفظ بيانات المالك");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });
}
