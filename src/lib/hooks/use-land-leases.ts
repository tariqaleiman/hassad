"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { landLeaseOutService } from "@/lib/services/land-lease-service";
import type { LandLeaseOutFormValues } from "@/lib/types/land-lease";
import { useAuth } from "@/lib/providers/auth-provider";

const LAND_LEASES_KEY = ["landLeases"] as const;

export function useLandLeases() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...LAND_LEASES_KEY, user?.uid],
    queryFn: () => landLeaseOutService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateLandLease() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: LandLeaseOutFormValues) => landLeaseOutService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LAND_LEASES_KEY, user?.uid] });
      toast.success("تم تسجيل عقد التأجير بنجاح");
    },
    onError: (err: any) => toast.error(err.message || "حدث خطأ أثناء تسجيل العقد"),
  });
}

export function useUpdateLandLease() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LandLeaseOutFormValues> }) =>
      landLeaseOutService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LAND_LEASES_KEY, user?.uid] });
      toast.success("تم تحديث بيانات العقد بنجاح");
    },
    onError: (err: any) => toast.error(err.message || "حدث خطأ أثناء التحديث"),
  });
}

export function useDeleteLandLease() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => landLeaseOutService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LAND_LEASES_KEY, user?.uid] });
      toast.success("تم إلغاء العقد بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الإلغاء"),
  });
}
