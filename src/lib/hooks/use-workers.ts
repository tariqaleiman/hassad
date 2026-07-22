"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workerService } from "@/lib/services/worker-service";
import type { WorkerFormValues } from "@/lib/types/worker";
import { useAuth } from "@/lib/providers/auth-provider";

const WORKERS_KEY = ["workers"] as const;

export function useWorkers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...WORKERS_KEY, user?.uid],
    queryFn: () => workerService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateWorker() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: WorkerFormValues) => workerService.create(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...WORKERS_KEY, user?.uid] });
      toast.success("تم إضافة العامل بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });
}

export function useUpdateWorker() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<WorkerFormValues> }) =>
      workerService.update(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...WORKERS_KEY, user?.uid] });
      toast.success("تم حفظ التعديلات");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useDeleteWorker() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => workerService.remove(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...WORKERS_KEY, user?.uid] });
      toast.success("تم حذف العامل");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}
