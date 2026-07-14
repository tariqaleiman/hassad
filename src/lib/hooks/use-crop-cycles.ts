"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cropCycleService } from "@/lib/services/crop-cycle-service";
import type { CropCycleFormValues } from "@/lib/types/crop-cycle";
import { useAuth } from "@/lib/providers/auth-provider";

const CROP_CYCLES_KEY = ["cropCycles"] as const;

export function useCropCycles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...CROP_CYCLES_KEY, user?.uid],
    queryFn: () => cropCycleService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateCropCycle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: CropCycleFormValues) => cropCycleService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROP_CYCLES_KEY, user?.uid] });
      toast.success("تم إنشاء دورة المحصول بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء إنشاء دورة المحصول"),
  });
}

export function useUpdateCropCycle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CropCycleFormValues> }) =>
      cropCycleService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROP_CYCLES_KEY, user?.uid] });
      toast.success("تم تحديث دورة المحصول بنجاح");
    },
    onError: (err: any) => {
      console.error("Update Crop Cycle Error:", err);
      toast.error(err.message || "حدث خطأ أثناء تحديث الدورة");
    },
  });
}

export function useMarkCropCycleHarvested() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => cropCycleService.markHarvested(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROP_CYCLES_KEY, user?.uid] });
      toast.success("تم تسجيل حصاد الدورة");
    },
    onError: () => toast.error("حدث خطأ أثناء تسجيل الحصاد"),
  });
}

export function useDeleteCropCycle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => cropCycleService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROP_CYCLES_KEY, user?.uid] });
      toast.success("تم حذف دورة المحصول");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}
