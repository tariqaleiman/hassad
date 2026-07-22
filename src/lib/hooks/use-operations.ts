"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/providers/auth-provider";
import { farmingOperationService } from "@/lib/services/farming-operation-service";

const OPERATIONS_KEY = ["farmingOperations"] as const;

export function useOperations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...OPERATIONS_KEY, user?.uid],
    queryFn: async () => farmingOperationService.list(user?.uid ?? ""),
    enabled: !!user?.uid,
  });
}

export function useCreateOperation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (values: any) => farmingOperationService.createOperation(values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...OPERATIONS_KEY, user?.uid] });
      toast.success("تم إضافة العملية بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });
}

export function useUpdateOperation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      farmingOperationService.updateOperation(id, values, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...OPERATIONS_KEY, user?.uid] });
      toast.success("تم التعديل بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء التعديل"),
  });
}

export function useDeleteOperation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => farmingOperationService.deleteOperation(id, user?.uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...OPERATIONS_KEY, user?.uid] });
      toast.success("تم حذف العملية");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });
}
