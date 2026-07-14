"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cropService } from "@/lib/services/crop-service";
import type { CropFormValues } from "@/lib/types/crop";
import { useAuth } from "@/lib/providers/auth-provider";

const CROPS_KEY = ["crops"] as const;

export function useCrops() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...CROPS_KEY, user?.uid],
    queryFn: async () => {
      const data = await cropService.list(user?.uid ?? "");
      return data.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    },
    enabled: !!user?.uid,
  });
}

export function useCreateCrop() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: CropFormValues) => cropService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROPS_KEY, user?.uid] });
      toast.success("تم إضافة المحصول بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء إضافة المحصول"),
  });
}

export function useUpdateCrop() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CropFormValues> }) =>
      cropService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROPS_KEY, user?.uid] });
      toast.success("تم حفظ التعديلات");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useDeleteCrop() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => cropService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROPS_KEY, user?.uid] });
      toast.success("تم حذف المحصول");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}

export function useSeedCrops() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => cropService.seedDefaults(user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CROPS_KEY, user?.uid] });
      toast.success("تم تحميل قائمة المحاصيل المصرية الجاهزة");
    },
    onError: () => toast.error("حدث خطأ أثناء تحميل القائمة الجاهزة"),
  });
}
