"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { farmService } from "@/lib/services/farm-service";
import type { FarmFormValues } from "@/lib/types/farm";
import { useAuth } from "@/lib/providers/auth-provider";

const FARMS_KEY = ["farms"] as const;

export function useFarms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...FARMS_KEY, user?.uid],
    queryFn: () => farmService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: FarmFormValues) => farmService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...FARMS_KEY, user?.uid] });
      toast.success("تم إضافة المزرعة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء إضافة المزرعة"),
  });
}

export function useUpdateFarm() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<FarmFormValues> }) =>
      farmService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...FARMS_KEY, user?.uid] });
      toast.success("تم حفظ التعديلات");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useDeleteFarm() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => farmService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...FARMS_KEY, user?.uid] });
      toast.success("تم حذف المزرعة");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}
