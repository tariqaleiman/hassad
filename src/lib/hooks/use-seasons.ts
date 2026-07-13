"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { seasonService } from "@/lib/services/season-service";
import type { SeasonFormValues } from "@/lib/types/season";
import { useAuth } from "@/lib/providers/auth-provider";

const SEASONS_KEY = ["seasons"] as const;

export function useSeasons() {
  return useQuery({
    queryKey: SEASONS_KEY,
    queryFn: () => seasonService.list(),
  });
}

export function useCreateSeason() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: SeasonFormValues) => seasonService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SEASONS_KEY });
      toast.success("تم إنشاء الموسم بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء إنشاء الموسم"),
  });
}

export function useUpdateSeason() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<SeasonFormValues> }) =>
      seasonService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SEASONS_KEY });
      toast.success("تم حفظ التعديلات");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useCloseSeason() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => seasonService.close(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SEASONS_KEY });
      toast.success("تم إغلاق الموسم");
    },
    onError: () => toast.error("حدث خطأ أثناء إغلاق الموسم"),
  });
}

export function useDeleteSeason() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => seasonService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SEASONS_KEY });
      toast.success("تم حذف الموسم");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}
