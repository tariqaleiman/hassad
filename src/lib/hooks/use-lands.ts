"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { landService } from "@/lib/services/land-service";
import type { LandFormValues } from "@/lib/types/land";
import { useAuth } from "@/lib/providers/auth-provider";

const LANDS_KEY = ["lands"] as const;

export function useLands() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...LANDS_KEY, user?.uid],
    queryFn: () => landService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateLand() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: LandFormValues) => landService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LANDS_KEY, user?.uid] });
      toast.success("تم إضافة قطعة الأرض بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء إضافة قطعة الأرض"),
  });
}

export function useUpdateLand() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LandFormValues> }) =>
      landService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LANDS_KEY, user?.uid] });
      toast.success("تم حفظ التعديلات");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useDeleteLand() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => landService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LANDS_KEY, user?.uid] });
      toast.success("تم حذف قطعة الأرض");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}
